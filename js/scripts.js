import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js"
import { getFirestore, collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js"

const firebaseConfig = {
apiKey: "AIzaSyAbQ2WoE4PiK7_YC0uwNTO5AW4yoOX1dCQ",
authDomain: "e-o-fazes.firebaseapp.com",
projectId: "e-o-fazes",
storageBucket: "e-o-fazes.appspot.com",
messagingSenderId: "662946845055",
appId: "1:662946845055:web:05bf93e8e343b685650a4a"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

const mensagem = (texto, status) => {
  let cor
  status ? cor = "#2d6cea" : cor = "rgb(187, 15, 50)"
  Toastify({
    text: texto,
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: cor,
      boxShadow: "0px 0px 19px 2px #2d6ceaa8",
    },
  }).showToast();
}

// CADASTRO

const cadastrar = async () => {
    const email = document.getElementById('email-cadastro').value
    const senha = document.getElementById('password-cadastro').value
    const confirmarSenha = document.getElementById('repassword-cadastro').value

    if (senha == confirmarSenha){
        createUserWithEmailAndPassword(auth, email, senha)
        .then(() => {
          mensagem('Usuário cadastrado com sucesso!', true)
          irParaTodo()
        })
        .catch(() => mensagem('Erro ao cadastrar!', false))
    } else {
        alert('Senhas diferentes!')
    }
}

const formCadastro = document.getElementById('modal-cadastro')
formCadastro.onsubmit = e => {
    e.preventDefault()
    cadastrar()
}

// LOGIN

const logar = () => {
  const email = document.getElementById('email-login').value
  const senha = document.getElementById('password-login').value

  signInWithEmailAndPassword(auth, email, senha)
  .then(() => {
    mensagem('Usuário logado com sucesso!', true)
    irParaTodo()
  })
  .catch((error) => {
    if(error.message == 'Firebase: Error (auth/wrong-password).'){mensagem('Email ou senha incorretos!', false)}
  })
}

const formLogin = document.getElementById('modal-login')
formLogin.onsubmit = e => {
    e.preventDefault()
    logar()
}

// LOGOUT

const deslogar = () => signOut(auth).then(() => sairDoTodo())

const botaoDeslogar = document.getElementById('botao-deslogar')
botaoDeslogar.onclick = () => deslogar()

// TODO LIST -------------------

// CREATE

const criarTarefa = async (tarefa, email, coluna) => {
  try {
    await addDoc(collection(db, "Tarefas"), {
      nome: tarefa,
      usuario: email,
      status: coluna,
      timestamp: serverTimestamp()
    })
    
  } catch (e) {
    console.error("Erro ao criar tarefa: ", e)
  }
}

// READ

const carregarTarefa = (nomeDaTarefa, coluna, statusTarefa) => {

  const tarefa = document.createElement('div')
  const containerTarefa = document.createElement('div')
  const containerBotoes = document.createElement('div')
  const nomeTarefa = document.createElement('p')
  const botaoDelete = document.createElement('button')

  tarefa.classList.add('tarefa')
  containerTarefa.classList.add('container-tarefa')
  containerBotoes.classList.add('container-tarefa')
  botaoDelete.classList.add('botao-deletar')
  nomeTarefa.classList.add('nome-tarefa')
  botaoDelete.innerHTML = 'X'
  nomeTarefa.innerHTML = nomeDaTarefa

  if(statusTarefa == 0){
    const botaoAvancar = document.createElement('button')
    botaoAvancar.classList.add('botao-avancar')
    botaoAvancar.classList.add('avancar')
    botaoAvancar.innerHTML = '>>'
    containerBotoes.appendChild(botaoAvancar)
  } else {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.classList.add('checkbox')
    containerTarefa.appendChild(checkbox)

    if(statusTarefa == 1){
      const botaoVoltar = document.createElement('button')
      botaoVoltar.classList.add('botao-avancar')
      botaoVoltar.classList.add('voltar')
      botaoVoltar.innerHTML = '<<'
      containerBotoes.appendChild(botaoVoltar)
    } else {
      checkbox.checked = true
    }
  }

  tarefa.appendChild(containerTarefa)
  tarefa.appendChild(containerBotoes)
  containerTarefa.appendChild(nomeTarefa)
  containerBotoes.appendChild(botaoDelete)
  coluna.children[1].appendChild(tarefa)
}

// UPTDATE

const atualizarTarefa = (classe, id, tarefa, valorColuna, valorStatus, coluna, inicio) => {
  const botaoAtualizar = document.getElementsByClassName(classe)
  
  for(let i = 0; i < botaoAtualizar.length; i++){
    const botao = botaoAtualizar[i]
    
    botao.addEventListener('click', async () => {
      if(tarefa == botao.parentElement.parentElement.children[0].children[valorColuna].innerHTML){
        botao.parentElement.parentElement.remove()
        // inicio ? '' : carregarTarefa(tarefa, coluna, valorStatus)
        console.log('funcao ativada')

        await updateDoc(doc(db, "Tarefas", id), {
          status: valorStatus
        })
      }
    })
  }
}

const verificarCheckbox = (id, tarefa) => {
  const checkbox = document.getElementsByClassName('checkbox')
  
  for(let i = 0; i < checkbox.length; i++){
    const box = checkbox[i]
    
    box.addEventListener('click', async () => {
      if(tarefa == box.parentElement.parentElement.children[0].children[1].innerHTML){
        let valor
        box.checked == true ? valor = 2 : valor = 1
        box.parentElement.parentElement.remove()
        await updateDoc(doc(db, "Tarefas", id), {
          status: valor
        })
      }
    })
  }
}

// DELETE

const deletarTarefa = (id, tarefa) => {
  const botaoDelete = document.getElementsByClassName('botao-deletar')

  for(let i = 0; i < botaoDelete.length; i++){
    const botao = botaoDelete[i]
    
    botao.addEventListener('click', async () => {
      if(tarefa == botao.parentElement.parentElement.children[0].children[0].innerHTML || tarefa == botao.parentElement.parentElement.children[0].children[1].innerHTML){
        botao.parentElement.parentElement.remove()
        await deleteDoc(doc(db, "Tarefas", id))
      }
    })
  }
}

const loginModal = document.getElementById('modal-login')
const cadastroModal = document.getElementById('modal-cadastro')
const modalBG = document.getElementById('container-modal-bg')

// MODAL LOGIN
const irParaLogin = function(){
  cadastroModal.style.display = 'none'
  loginModal.style.display = 'flex'
}

const botaoIrLogin = document.getElementById('botao-ir-login')
botaoIrLogin.onclick = () => irParaLogin()

// MODAL CADASTRO
const irParaCadastro = function(){
  loginModal.style.display = 'none'
  cadastroModal.style.display = 'flex'
}

const botaoIrCadastro = document.getElementById('botao-ir-cadastro')
botaoIrCadastro.onclick = () => irParaCadastro()

// IR E SAIR DO TODO

const irParaTodo = function(){
  modalBG.style.display = 'none'
}

const sairDoTodo = function(){
  modalBG.style.display = 'flex'
  irParaLogin()
}

// STATUS DO USUÁRIO

const colunaFazer = document.getElementById('coluna-para-fazer')
const colunaFazendo = document.getElementById('coluna-fazendo')
const colunaFeito = document.getElementById('coluna-feito')

onAuthStateChanged(auth, (user) => {
  if (user) {
    irParaTodo()
    // console.log(user.email)
    const formParaFazer = document.getElementById('form-para-fazer')
    const formFazendo = document.getElementById('form-fazendo')
    let sinal
    formParaFazer.onsubmit = e => {
      const tarefa = formParaFazer.children[0]
      e.preventDefault()
      criarTarefa(tarefa.value, user.email, 0)
      tarefa.value = ''
      sinal = true
    }
    
    formFazendo.onsubmit = e => {
      const tarefa = formFazendo.children[0]
      e.preventDefault()
      criarTarefa(tarefa.value, user.email, 1)
      tarefa.value = ''
      sinal = true
    }

    const tarefas = query(collection(db, "Tarefas"), where("usuario", "==", user.email))
    onSnapshot(tarefas, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let status = change.doc.data().status
        let tarefaID = change.doc.id
        let tarefaNome = change.doc.data().nome
        let inicio

        if (change.type === "added" || change.type === "modified") {
          change.type === "added" && change.type != "modified" ? inicio = true : inicio = false       

          if(status == 0){
            if(inicio){
              inicio = false
            }

            carregarTarefa(tarefaNome, colunaFazer, status)
            if(sinal){
              
            }
            atualizarTarefa('avancar', tarefaID, tarefaNome, 0, 1, colunaFazendo, inicio)

          } else if(status == 1){
            if(inicio){
              inicio = false
            }
            carregarTarefa(tarefaNome, colunaFazendo, status)
            atualizarTarefa('voltar', tarefaID, tarefaNome, 1, 0, colunaFazer, inicio)

          } else {
            carregarTarefa(tarefaNome, colunaFeito, status)
          }

          verificarCheckbox(tarefaID, tarefaNome)
          deletarTarefa(tarefaID, tarefaNome)
        } 
        
        if (change.type === "modified") {
          console.log('modified')
        
        }
      })
    })

  } else {
    console.log('Não tem ninguém aqui!')
    mensagem('Usuário deslogado!', true)
    sairDoTodo()
    colunaFazer.children[1].innerHTML = ''
    colunaFazendo.children[1].innerHTML = ''
    colunaFeito.children[1].innerHTML = ''
  }
})