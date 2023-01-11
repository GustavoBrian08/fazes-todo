import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js"
import { getFirestore, collection, addDoc, query, where, onSnapshot, Timestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js"

// CONFIG DO FIREBASE

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

// FUNÇÃO PRA TOASTS PERSONALIZADOS

const mensagem = (texto, status) => {
  let cor
  status ? cor = "#2d6cea" : cor = "rgb(187, 15, 50)"
  Toastify({
    text: texto,
    duration: 2000,
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
        mensagem('Senhas diferentes!', false)
    }
}

const formCadastro = document.getElementById('modal-cadastro')
formCadastro.onsubmit = e => {
    e.preventDefault()
    cadastrar()
}

// LOGIN

const logar = () => {
  const email = document.getElementById('email-login')
  const senha = document.getElementById('password-login')

  signInWithEmailAndPassword(auth, email.value, senha.value)
  .then(() => {
    mensagem('Usuário logado com sucesso!', true)
    irParaTodo()

    email.value = ''
    senha.value = ''
  })
  .catch((error) => {
    if(error.message == 'Firebase: Error (auth/wrong-password).'){ mensagem('Email ou senha incorretos!', false) }
  })
}

const formLogin = document.getElementById('modal-login')
formLogin.onsubmit = e => {
    e.preventDefault()
    logar()
}

// LOGOUT

const deslogar = () => signOut(auth).then(() => {
  mensagem('Usuário deslogado!', true)
  sairDoTodo()
  setTimeout(() => window.location.reload(), 2050)
  
})

const botaoDeslogar = document.getElementById('botao-deslogar')
botaoDeslogar.onclick = () => deslogar()


// -------------------------- TODO LIST --------------------------

// CREATE

const criarTarefa = async (tarefa, email, coluna) => {
  if(tarefa.length != 0 && tarefa != ' '){
    try {
      await addDoc(collection(db, "Tarefas"), {
        nome: tarefa,
        usuario: email,
        status: coluna,
        descricao: '',
        timestamp: Timestamp.now()
      })
      
    } catch (e) {
      mensagem(`Erro ao criar tarefa: ${e}`, false)
    }
  }
}

// READ

const carregarTarefa = (nomeDaTarefa, coluna, statusTarefa) => {

  const tarefa = document.createElement('div')
  const containerTarefa = document.createElement('div')
  const containerBotoes = document.createElement('div')
  const nomeTarefa = document.createElement('p')
  const botaoDelete = document.createElement('button')
  const iconDelete = document.createElement('i')

  tarefa.classList.add('tarefa')
  containerTarefa.classList.add('container-tarefa')
  containerBotoes.classList.add('container-tarefa')
  botaoDelete.classList.add('botao-deletar')
  nomeTarefa.classList.add('nome-tarefa')
  iconDelete.classList.add('fa-solid')
  iconDelete.classList.add('fa-trash-can')
  nomeTarefa.innerHTML = nomeDaTarefa

  if(statusTarefa == 0){
    const botaoAvancar = document.createElement('button')
    const icon = document.createElement('i')
    botaoAvancar.classList.add('botao-avancar')
    botaoAvancar.classList.add('avancar')
    icon.classList.add('fa-solid')
    icon.classList.add('fa-right-long')
    botaoAvancar.appendChild(icon)
    containerBotoes.appendChild(botaoAvancar)
  } else {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.classList.add('checkbox')
    containerTarefa.appendChild(checkbox)

    if(statusTarefa == 1){
      const botaoVoltar = document.createElement('button')
      const icon = document.createElement('i')
      botaoVoltar.classList.add('botao-avancar')
      botaoVoltar.classList.add('voltar')
      icon.classList.add('fa-solid')
      icon.classList.add('fa-left-long')
      botaoVoltar.appendChild(icon)
      containerBotoes.appendChild(botaoVoltar)
    } else {
      checkbox.checked = true
    }
  }

  tarefa.appendChild(containerTarefa)
  tarefa.appendChild(containerBotoes)
  containerTarefa.appendChild(nomeTarefa)
  botaoDelete.appendChild(iconDelete)
  containerBotoes.appendChild(botaoDelete)
  coluna.children[1].appendChild(tarefa)
}

// UPDATE

const atualizarTarefa = (classe, id, tarefa, valorColuna, valorStatus) => {
  const botaoAtualizar = document.getElementsByClassName(classe)
  
  for(let i = 0; i < botaoAtualizar.length; i++){
    const botao = botaoAtualizar[i]
    
    botao.addEventListener('click', async () => {
      if(tarefa == botao.parentElement.parentElement.children[0].children[valorColuna].innerHTML){
        botao.parentElement.parentElement.remove()
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

// CORRIGE E EVITA ALGUNS BUGS

let criouTarefa
const removerDuplicatas = (tarefa) => {
  const nomeTarefa = document.getElementsByClassName('nome-tarefa')
  for(let i = 0; i < nomeTarefa.length; i++){
    if(tarefa == nomeTarefa[i].innerHTML && criouTarefa){
      nomeTarefa[i].parentElement.parentElement.remove()
      criouTarefa = false
    }
  }
}


// ------------ MODAIS --------------

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

// MODAL TAREFA

const abrirModalTarefa = () => {
  const modalBg = document.getElementById('tarefa-aberta-bg')
  modalBg.style.display = 'flex'
}

const fecharModalTarefa = () => {
  const modalBg = document.getElementById('tarefa-aberta-bg')
  modalBg.style.display = 'none'
}

const descricao = document.getElementById('descricao')
const atualizarDescricao = async (id) => {
  await updateDoc(doc(db, "Tarefas", id), {
    descricao: descricao.value
  })
}

const visualizarTarefa = (nomeTarefa, data, textoDescricao, tarefaID) => {
  const tarefa = document.getElementsByClassName('tarefa')
  const nomeTarefaModal = document.getElementById('nome-tarefa-modal')
  const dataTarefa = document.getElementById('data-tarefa')
  for(let i = 0; i < tarefa.length; i++){
    const tarefaSelecionada = tarefa[i]
    tarefaSelecionada.addEventListener('click', (event) => {
      if ((event.target == tarefaSelecionada || event.target.innerText == tarefaSelecionada.children[0].innerText) && event.target.innerText == nomeTarefa){
        abrirModalTarefa()
        
        nomeTarefaModal.innerHTML = tarefaSelecionada.children[0].innerText
        descricao.value = textoDescricao
        dataTarefa.innerHTML = data

        const editarDescricao = document.getElementById('editar-descricao')
        editarDescricao.onclick = (event) => {
          event.preventDefault()
          const tituloModal = editarDescricao.parentElement.children[0].children[1].innerText

          if(tituloModal == nomeTarefa){
            atualizarDescricao(tarefaID)
            setTimeout(() => window.location.reload(), 500)
          }
        }
      }
    })
  }
}


// STATUS DO USUÁRIO

const colunaFazer = document.getElementById('coluna-para-fazer')
const colunaFazendo = document.getElementById('coluna-fazendo')
const colunaFeito = document.getElementById('coluna-feito')

onAuthStateChanged(auth, (user) => {
  if (user) { // USUARIO LOGADO
    irParaTodo()
    const formParaFazer = document.getElementById('form-para-fazer')
    const formFazendo = document.getElementById('form-fazendo')

    formParaFazer.onsubmit = e => {
      const tarefa = formParaFazer.children[0]
      e.preventDefault()
      criarTarefa(tarefa.value, user.email, 0)
      tarefa.value = ''
      criouTarefa = true
    }
    
    formFazendo.onsubmit = e => {
      const tarefa = formFazendo.children[0]
      e.preventDefault()
      criarTarefa(tarefa.value, user.email, 1)
      tarefa.value = ''
      criouTarefa = true
    }

    const tarefas = query(collection(db, "Tarefas"), where("usuario", "==", user.email))
    onSnapshot(tarefas, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let status = change.doc.data().status
        let tarefaID = change.doc.id
        let tarefaNome = change.doc.data().nome
        let timestamp = new Date(change.doc.data().timestamp.toDate()).toLocaleString()
        let descricaoTarefa = change.doc.data().descricao
        
        if (change.type === "added" || change.type === "modified") {
          console.clear()
          if(status == 0){
            carregarTarefa(tarefaNome, colunaFazer, status)
            atualizarTarefa('avancar', tarefaID, tarefaNome, 0, 1)

          } else if(status == 1){
            carregarTarefa(tarefaNome, colunaFazendo, status)
            atualizarTarefa('voltar', tarefaID, tarefaNome, 1, 0)

          } else {
            carregarTarefa(tarefaNome, colunaFeito, status)
          }
          verificarCheckbox(tarefaID, tarefaNome)
          // removerDuplicatas(tarefaNome)
          deletarTarefa(tarefaID, tarefaNome)
          visualizarTarefa(tarefaNome, timestamp, descricaoTarefa, tarefaID)
        } 
        
        const botaoFecharModal = document.getElementById('fechar-modal')
        const modalTarefaBg = document.getElementById('tarefa-aberta-bg')
        
        botaoFecharModal.onclick = () => fecharModalTarefa(tarefaID)
        modalTarefaBg.onclick = event => { event.target == modalTarefaBg ? fecharModalTarefa(tarefaID) : false }
      })
    })

  } else { // USUARIO DESLOGADO
    sairDoTodo()
    colunaFazer.children[1].innerHTML = ''
    colunaFazendo.children[1].innerHTML = ''
    colunaFeito.children[1].innerHTML = ''
  }
})