
const validate_email = (email:string): boolean =>{
     const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
     return email_regex.test(email)
}

const validate_name = (name:string): boolean =>{
    const name_regex = /^[a-zA-Z ]{2,15}$/
    return name_regex.test(name)
}

export default {
    validate_email,
    validate_name
}