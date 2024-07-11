class criaConta {
    constructor (nome, sobrenome, email, senha, confirmarSenha){
        this.nome = nome,
        this.sobrenome = sobrenome,
        this.email = email,
        this.senha = senha,
        this.confirmarSenha = confirmarSenha
    }

    validarEntrada(){
        if (this.nome !="" || this.sobrenome != "" || this.email != "" || this.senha != "" || this.confirmarSenha != "") {
         return  false "Preencha todos os campos";   
        
        } else { return alert('Seja bem-vindo, sua conta foi criada')

        }
        
    }

    VerificacaoDeSenha(validSenha){
        for( let this.confirmarSenha in criaConta ) {
            console.log(`${this.confirmarSenha} = ${criarConta[this.confirmarSenha]}`;)
        }
            
        }


       mostraResultado(){
        const nome = this.nome();
        const sobrenome = this.sobrenome();
        const email = this.email();
        const senha = this.senha();
        const confirmarSenha = this.VerificacaoDeSenha(validSenha);
        console.log(`O nome é ${nome}`);
        console.log(`O sobrenome é ${sobrenome}`);
        console.log(`O e-mail é ${email}`);
        console.log(`A senha é ${senha}`);
        console.log(`A confirmação ${confirmarSenha} esta correta`)
       } 

    }


    const nome = prompt('Digite seu nome:')
    const sobrenome = prompt('Digite seu sobrenome:')
    const email = prompt('Digite seu e-mail:')
    const senha = prompt('Digite uma senha')
    const confirmarSenha = prompt('Repita sua senha')

    const criaConta = new criarConta (nome, sobrenome, email, senha, confirmarSenha)

criaConta.mostraResultado();