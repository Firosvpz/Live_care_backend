import AdminUsecase from "../../usecases/admin_usecase";
import { Request, Response, NextFunction } from "express";


class AdminController {
    constructor(private admin_usecase: AdminUsecase) { }
    async verifyAdminLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body
            const response = await this.admin_usecase.verifyLogin(email, password)
            const token = response.token
            if (response?.success) {
                const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
                res.cookie("adminToken", token, {
                    expires: expiryDate,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                })
                return res.status(200).json(response)
            }
            return res.status(400).json(response)
        } catch (error) {
            next(error)
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
            const { users, total } = await this.admin_usecase.getAllUsers(page, limit);
            return res
                .status(200)
                .json({
                    success: true,
                    data: users,
                    total,
                    message: "Users list fetched",
                });
        } catch (error) {
            next(error)
        }
    }

    async blockUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            console.log(userId);
            
            const userBlocked = await this.admin_usecase.blockUser(userId)
            console.log('blk',userBlocked);
            
            if (userBlocked) {
                res.status(200).json({ success: true })
            }
        } catch (error) {
            next(error)
        }
    }

    async getAllServiceProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
            const { sp, total } = await this.admin_usecase.getAllServiceProviders(page, limit);
            return res
                .status(200)
                .json({
                    success: true,
                    data: sp,
                    total,
                    message: "ServiceProviders list fetched",
                });

        } catch (error) {
           next(error)
        }
    }

    async getSpDetails(req: Request, res: Response, next: NextFunction){
        try {
            const{id}=req.params
            const spDetails = await this.admin_usecase.serviceProviderDetails(id)
            return res.status(200).json({
                success:true,
                data:spDetails,
                message:"service provider details fetched"
            })

        } catch (error) {
            next(error)
        }
    }

    async approveServiceProviders(req: Request, res: Response, next: NextFunction){
        try {
            const{id}=req.params
            const spApproved = await this.admin_usecase.approveServiceProvider(id)
            if(spApproved){
                res
                .status(200)
                .json({ success: true, message: "serviceProvider approved" });
            }else{
                res
                .status(400)
                .json({ success: false, message: "Failed to approve serviceProvider" });
            }
        } catch (error) {
            next(error)
        }
    }

    async blockServiceProvider(req: Request, res: Response, next: NextFunction){
        try {
            const{id}=req.params
            const blockedSp = await this.admin_usecase.blockServiceProvider(id)
            if(blockedSp){
                res.status(200).json({
                    success:true,    
                })
            }
        } catch (error) {
            next(error)
        }
    }
}

export default AdminController