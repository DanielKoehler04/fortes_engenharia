const Auth = {
  usuarios: {
    'gerente': { senha: '123456', papel: 'gerente', nome: 'Ana Silva' },
    'encarregado': { senha: '654321', papel: 'encarregado', nome: 'Bruno Santos' },
    'tecnico': { senha: '162534', papel: 'tecnico', nome: 'Carlos Oliveira' }
  },

  login(usuario, senha) {
    let user = this.usuarios[usuario];
    
    if(!user || user.senha !== senha) {
      return { sucesso: false, mensagem: 'Usuário ou senha inválidos' };
    }

    let sessao = {
      usuario: usuario,
      papel: user.papel,
      nome: user.nome,
      loginEm: new Date().toISOString()
    };

    localStorage.setItem('sessao', JSON.stringify(sessao));
    return { sucesso: true, sessao };
  },

  logout() {
    localStorage.removeItem('sessao');
    window.location.href = 'index.html';
  },

  estaAutenticado() {
    return this.obterSessao() != null;
  },

  obterSessao() {
    let sessaoStr = localStorage.getItem('sessao');
    if(!sessaoStr) return null;
    
    try {
      return JSON.parse(sessaoStr);
    } catch (e) {
      return null;
    }
  },

  temPermissao(papel) {
    let sessao = this.obterSessao();
    if(!sessao) return false;
    
    if(Array.isArray(papel)) return papel.includes(sessao.papel);
    
    return sessao.papel === papel;
  },

  protegerPagina(papeisPermitidos = null) {
    if(!this.estaAutenticado()) {
      window.location.href = 'index.html';
      return false;
    }

    if(papeisPermitidos) {
      if(!this.temPermissao(papeisPermitidos)) {
        alert('Você não tem permissão para acessar esta página');
        window.location.href = 'painel.html';
        return false;
      }
    }

    return true;
  },

  redirecionarPorPapel() {
    let sessao = this.obterSessao();
    if(!sessao) {
      window.location.href = 'index.html';
      return;
    }
    window.location.href = 'painel.html';
  },

  inicializarUI() {
    let sessao = this.obterSessao();
    if(!sessao) return;

    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = sessao.nome;
    });

    document.querySelectorAll('.user-role').forEach(el => {
      let papeis = {'gerente': 'Gerente', 'encarregado': 'Encarregado', 'tecnico': 'Técnico'};
      el.textContent = papeis[sessao.papel] || sessao.papel;
    });

    document.querySelectorAll('[data-papel]').forEach(el => {
      const papelRequerido = el.dataset.papel.split(',');
      if (!this.temPermissao(papelRequerido)) {
        el.style.display = 'none';
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Auth.inicializarUI());
} else {
  Auth.inicializarUI();
}
