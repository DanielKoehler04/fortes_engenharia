const Storage = {
  keys: {
    projetos: 'fortes_projetos',
    solicitacoes: 'fortes_solicitacoes',
    aprovacoes: 'fortes_aprovacoes'
  },

  obterProjetos() {
    let data = localStorage.getItem(this.keys.projetos);
    if(data) return JSON.parse(data);
    return this.projetosIniciais();
  },

  projetosIniciais() {
    return [
      { id: 1, nome: 'Ponte Rodoviária VV', cliente: 'Prefeitura de Vila Velha', codigo: 'PRJ-001', ativo: true },
      { id: 2, nome: 'Reforma Industrial CST', cliente: 'Companhia Siderúrgica', codigo: 'PRJ-002', ativo: true },
      { id: 3, nome: 'Ampliação Porto Capuaba', cliente: 'Autoridade Portuária', codigo: 'PRJ-003', ativo: true }
    ];
  },

  salvarProjeto(projeto) {
    let projetos = this.obterProjetos();
    
    if (!projeto.id) {
      projeto.id = Date.now();
      projeto.ativo = true;
      projetos.push(projeto);
    } else {
      let idx = projetos.findIndex(p => p.id === projeto.id);
      if (idx >= 0) {
        projetos[idx] = {...projetos[idx], ...projeto};
      }
    }

    localStorage.setItem(this.keys.projetos, JSON.stringify(projetos));
    return projeto;
  },

  excluirProjeto(id) {
    let projetos = this.obterProjetos();
    projetos = projetos.filter(p => p.id !== id);
    localStorage.setItem(this.keys.projetos, JSON.stringify(projetos));
  },

  obterSolicitacoes() {
    let data = localStorage.getItem(this.keys.solicitacoes);
    if(!data) return [];
    return JSON.parse(data);
  },

  obterSolicitacaoPorId(id) {
    return this.obterSolicitacoes().find(s => s.id === id);
  },

  salvarSolicitacao(solicitacao) {
    let solicitacoes = this.obterSolicitacoes();
    let sessao = Auth.obterSessao();
    
    if (!solicitacao.id) {
      solicitacao.id = Date.now();
      solicitacao.solicitante = sessao.usuario;
      solicitacao.solicitanteNome = sessao.nome;
      solicitacao.status = 'pendente';
      solicitacao.criadoEm = new Date().toISOString();
      solicitacao.slaStatus = 'no_prazo';
      solicitacoes.push(solicitacao);
    } else {
      let i = solicitacoes.findIndex(s => s.id === solicitacao.id);
      if(i >= 0) solicitacoes[i] = {...solicitacoes[i], ...solicitacao};
    }

    localStorage.setItem(this.keys.solicitacoes, JSON.stringify(solicitacoes));
    return solicitacao;
  },

  excluirSolicitacao(id) {
    let solicitacoes = this.obterSolicitacoes();
    solicitacoes = solicitacoes.filter(s => s.id !== id);
    localStorage.setItem(this.keys.solicitacoes, JSON.stringify(solicitacoes));
  },

  obterMinhasSolicitacoes() {
    let sessao = Auth.obterSessao();
    return this.obterSolicitacoes().filter(s => s.solicitante === sessao.usuario);
  },

  obterSolicitacoesPendentes() {
    let sessao = Auth.obterSessao();
    let solicitacoes = this.obterSolicitacoes();
    
    if(sessao.papel === 'encarregado' || sessao.papel === 'gerente') {
      return solicitacoes.filter(s => s.status === 'pendente');
    } 
    if(sessao.papel === 'gerente' || sessao.papel === 'encarregado') {
      return solicitacoes.filter(s => s.status === 'aprovada_encarregado');
    }
    
    return [];
  },

  aprovarSolicitacao(solicitacaoId, obs = '') {
    let sessao = Auth.obterSessao();
    let sol = this.obterSolicitacaoPorId(solicitacaoId);
    
    if(!sol) return false;

    if(sessao.papel === 'encarregado') {
      sol.status = 'aprovada_encarregado';
    } 
    if(sessao.papel === 'gerente') {
      sol.status = 'aprovada_gerente';
    }

    let aprovacao = {
      id: Date.now(),
      solicitacaoId: solicitacaoId,
      etapa: sessao.papel,
      aprovador: sessao.usuario,
      aprovadorNome: sessao.nome,
      status: 'aprovado',
      observacao: obs,
      dataHora: new Date().toISOString()
    };

    let aprovacoes = this.obterAprovacoes();
    aprovacoes.push(aprovacao);
    localStorage.setItem(this.keys.aprovacoes, JSON.stringify(aprovacoes));
    this.salvarSolicitacao(sol);

    return true;
  },

  reprovarSolicitacao(solicitacaoId, justificativa) {
    let sessao = Auth.obterSessao();
    let sol = this.obterSolicitacaoPorId(solicitacaoId);
    
    if(!sol) return false;

    sol.status = 'reprovada';
    sol.justificativaRecusa = justificativa;

    let aprov = {
      id: Date.now(),
      solicitacaoId,
      etapa: sessao.papel,
      aprovador: sessao.usuario,
      aprovadorNome: sessao.nome,
      status: 'reprovado',
      observacao: justificativa,
      dataHora: new Date().toISOString()
    };

    let aprovacoes = this.obterAprovacoes();
    aprovacoes.push(aprov);
    localStorage.setItem(this.keys.aprovacoes, JSON.stringify(aprovacoes));
    this.salvarSolicitacao(sol);

    return true;
  },

  obterAprovacoes() {
    let data = localStorage.getItem(this.keys.aprovacoes);
    return data ? JSON.parse(data) : [];
  },

  obterAprovacoesPorSolicitacao(solicitacaoId) {
    return this.obterAprovacoes().filter(a => a.solicitacaoId === solicitacaoId);
  },

  obterRelatorioHorasPorColaborador(mesAno = null) {
    let sols = this.obterSolicitacoes().filter(s => 
      s.status === 'aprovada_encarregado' || s.status === 'aprovada_gerente'
    );

    let rel = {};

    sols.forEach(sol => {
      if(!sol.itens) return;

      sol.itens.forEach(item => {
        if(!rel[item.colaboradorNome]) {
          rel[item.colaboradorNome] = {
            nome: item.colaboradorNome,
            totalMinutos: 0,
            totalSolicitacoes: new Set()
          };
        }

        rel[item.colaboradorNome].totalMinutos += item.minutos;
        rel[item.colaboradorNome].totalSolicitacoes.add(sol.id);
      });
    });

    return Object.values(rel).map(r => ({
      colaborador: r.nome,
      totalHoras: (r.totalMinutos / 60).toFixed(2),
      totalSolicitacoes: r.totalSolicitacoes.size
    }));
  },

  obterRelatorioHorasPorProjeto() {
    let sols = this.obterSolicitacoes().filter(s => 
      s.status === 'aprovada_encarregado' || s.status === 'aprovada_gerente'
    );

    let rel = {};

    sols.forEach(sol => {
      if(!rel[sol.projetoNome]) {
        rel[sol.projetoNome] = {
          projeto: sol.projetoNome,
          totalMinutos: 0,
          totalSolicitacoes: 0
        };
      }

      if(sol.itens) {
        sol.itens.forEach(item => {
          rel[sol.projetoNome].totalMinutos += item.minutos;
        });
      }

      rel[sol.projetoNome].totalSolicitacoes++;
    });

    return Object.values(rel).map(r => ({
      ...r,
      totalHoras: (r.totalMinutos / 60).toFixed(2)
    }));
  },

  limparTodosDados() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem(this.keys.projetos);
      localStorage.removeItem(this.keys.solicitacoes);
      localStorage.removeItem(this.keys.aprovacoes);
      alert('Dados limpos com sucesso!');
      window.location.reload();
    }
  }
};
