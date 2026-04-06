Client have to send post create new chat first.
edit Message table, remove unnessage field, only keep content, move other to Attachent

create Attachment table
    message Id
    content:str
    image:str (url)


client send request post "/chatbot/message"

body:
    fundus_left:image (optional)
    fundus_right:image (optional)
    age: (optional)
    gender: (optional)
    prompt:(require)
    chat_id:(require)

process:
    transaction atomicy
        save message user
        image store in server local
        save attachment for user message(image fundus, other info user)
        hanle model service(Ocular,DR,LLM)
    

response:
    SSE , stream token
    after finish,create new message for system. then create attachment with content from Ocular model and DR model service result



standardize return type ,only apply for regular REST responses (not SEE):     
{"message": str,
    "error": str,
    "statusCode": number 
}
