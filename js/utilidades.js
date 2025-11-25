const App = {
  formatarData(dataISO) {
    if(!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  },

  formatarDataHora(dataISO) {
    if(!dataISO) return '-';
    return new Date(dataISO).toLocaleString('pt-BR');
  },

  formatarHora(hora) {
    return hora ? hora.substring(0, 5) : '-';
  },

  formatarMinutosParaHoras(minutos) {
    let h = Math.floor(minutos / 60);
    let m = minutos % 60;
    return `${h}h${m.toString().padStart(2, '0')}`;
  },

  obterClasseStatus(status) {
    let map = {'pendente': 'etiqueta-pendente', 'aprovada_encarregado': 'etiqueta-aprovada_encarregado', 
               'aprovada_gerente': 'etiqueta-aprovada_gerente', 'reprovada': 'etiqueta-reprovada'};
    return map[status] || '';
  },

  obterTextoStatus(status) {
    let textos = {'pendente': 'Pendente', 'aprovada_encarregado': 'Aprovada - Encarregado',
                  'aprovada_gerente': 'Aprovada - Gerente', 'reprovada': 'Reprovada', 'rascunho': 'Rascunho'};
    return textos[status] || status;
  },

  obterClasseSLA(slaStatus) {
    return slaStatus === 'atrasada' ? 'badge-danger' : 'badge-success';
  },

  obterTextoSLA(slaStatus) {
    return slaStatus === 'atrasada' ? 'Atrasada' : 'No Prazo';
  },

  validarFormulario(formId) {
    let form = document.getElementById(formId);
    if(!form) return false;

    let campos = form.querySelectorAll('[required]');
    let valido = true;

    campos.forEach(campo => {
      if(!campo.value.trim()) {
        campo.classList.add('is-invalid');
        valido = false;
      } else {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
      }
    });

    return valido;
  },

  limparValidacao(formId) {
    let form = document.getElementById(formId);
    if(!form) return;

    form.querySelectorAll('.is-invalid, .is-valid').forEach(campo => {
      campo.classList.remove('is-invalid', 'is-valid');
    });
  },

  calcularMinutos(horaInicio, horaFim) {
    if(!horaInicio || !horaFim) return 0;

    let [h1, m1] = horaInicio.split(':').map(Number);
    let [h2, m2] = horaFim.split(':').map(Number);

    let inicio = h1 * 60 + m1;
    let fim = h2 * 60 + m2;

    return fim > inicio ? fim - inicio : 0;
  },


  abrirJanela(id) {
    let j = document.getElementById(id);
    if(j) j.classList.add('active');
  },

  fecharJanela(id) {
    let j = document.getElementById(id);
    if(j) j.classList.remove('active');
  },

  renderizarTabela(containerId, dados, colunas) {
    let container = document.getElementById(containerId);
    if(!container) return;

    if(dados.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">Nenhum registro encontrado.</p>';
      return;
    }

    let html = '<div class="tabela-responsiva"><table class="table"><thead><tr>';
    
    colunas.forEach(col => {
      html += `<th>${col.titulo}</th>`;
    });
    
    html += '</tr></thead><tbody>';

    dados.forEach(item => {
      html += '<tr>';
      colunas.forEach(col => {
        const valor = col.renderizar ? col.renderizar(item) : item[col.campo];
        html += `<td>${valor}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  },

  voltarPagina() {
    window.history.back();
  },

  irParaPagina(url) {
    window.location.href = url;
  }
};

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('janela')) {
    e.target.classList.remove('active');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.janela.active').forEach(j => {
      j.classList.remove('active');
    });
  }
});
