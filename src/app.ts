// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction


let apiKey = 'b740e06f2eccc87c5e2c866d2821e725'
const listId = '7101979'

interface Token{
  success?: boolean,
  expires_at?: string,
  request_token?: string
}

interface Session{
  success: boolean,
  session_id: string
}

interface User{
  requestToken: string,
  username: string,
  password:string,
  sessionId: string,
}

interface Result{
  page:number,
  results: MovieList[]
}

interface MovieList{
  poster_path?: string,
  adult?: boolean,
  overview?: string,
  release_date?: string,
  genre_ids?: number[],
  id?: number,
  original_title?: string,
  original_language?: string,
  title?: string,
  backdrop_path?: string,
  popularity?: number,
  vote_count?: number,
  video?: boolean,
  vote_average?: number,
  total_pages?: number,
  total_results?: number
}

const user: User = {
  requestToken: '',
  username: '',
  password:'',
  sessionId:'',
}


let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button');
let searchContainer = document.getElementById('search-container');

loginButton?.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
})

searchButton?.addEventListener('click', async () => {
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  const search = document.getElementById('search') as HTMLInputElement
  if(search){
    let query = search.value ;
    let listaDeFilmes:Result= await procurarFilme(query);
    let ul = document.createElement('ul');
    ul.id = "lista"
    for (const item of listaDeFilmes.results) {
      let li = document.createElement('li');
      li.appendChild(document.createTextNode(item.original_title as string))
      ul.appendChild(li)
    }
    console.log(listaDeFilmes);
    searchContainer?.appendChild(ul);
  }

})

function preencherSenha() {
  const passwordInput = document.getElementById('senha') as HTMLInputElement
  if(passwordInput){
    user.password = passwordInput.value;
    validateLoginButton();
  }
  

}

function preencherLogin() {
  const loginInput = document.getElementById('login') as HTMLInputElement
  if(loginInput){
    user.username =  loginInput.value;
    validateLoginButton();
  }
}

function preencherApi() {
  const apiInput = document.getElementById('api-key') as HTMLInputElement
  if(apiInput){
    apiKey = apiInput.value;
    validateLoginButton();
  }
}

function validateLoginButton() {
  if (user.password && user.username && apiKey) {
      loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

class HttpClient {
  static async get({url = '', method = '', body = ''}) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = body;
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query: string):Promise<Result> {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result as Result
}

async function adicionarFilme(filmeId:number) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  }) as Token
  user.requestToken = result.request_token as string
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body:JSON.stringify({
      username: `${user.username}`,
      password: `${user.password}`,
      request_token: `${user.requestToken}`
    })
  })
}

async function criarSessao() {
  const {requestToken} = user
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "POST"
  }) as Session
  user.sessionId = result.session_id;
}

async function criarLista(nomeDaLista: string, descricao : string) {
  const {sessionId} = user
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body:JSON.stringify({
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    })
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId: string, listaId: string) {
  const  {sessionId} = user
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: JSON.stringify({
      media_id: filmeId
    })
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}

