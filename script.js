// Elementos do DOM
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const calendarGrid = document.getElementById('calendar-grid');
        const teamToggleBanner = document.getElementById('team-toggle-banner');
        const teamNameDisplay = document.getElementById('team-name-display');
        const goalsText = document.getElementById('goals-text');
        const observationText = document.getElementById('observation-text');
        const notesContainer = document.getElementById('notes-container'); // New: container for notes

        // Estado atual da equipe e dados do planejador
        let currentTeam = 'tarde'; // Equipe padrão ao carregar
        let plannerData = {
            'tarde': {
                dailyEntries: {} // Chave: 'YYYY-MM', Valor: Objeto com notes, goals, observation e days
            },
            'manha': {
                dailyEntries: {}
            }
        };

        // Mapeamento de nomes de equipe para exibição
        const teamDisplayNames = {
            'tarde': 'Equipe tarde: Fernanda',
            'manha': 'Equipe manhã: Camila'
        };

        // Feriados nacionais fixos no Brasil (mês é 0-indexado: Janeiro=0, Fevereiro=1, etc.)
        const nationalHolidays = [
            { month: 0, day: 1, name: "Confraternização Universal" }, // 1º de Janeiro
            { month: 3, day: 21, name: "Tiradentes" }, // 21 de Abril
            { month: 4, day: 1, name: "Dia do Trabalho" }, // 1º de Maio
            { month: 8, day: 7, name: "Independência do Brasil" }, // 7 de Setembro
            { month: 9, day: 12, name: "Nossa Senhora Aparecida" }, // 12 de Outubro
            { month: 10, day: 2, name: "Finados" }, // 2 de Novembro
            { month: 10, day: 15, name: "Proclamação da República" }, // 15 de Novembro
            { month: 11, day: 25, name: "Natal" } // 25 de Dezembro
        ];

        /**
         * Obtém ou inicializa os dados do mês/ano para a equipe ativa.
         * @returns {object} O objeto de dados para o mês/ano atual.
         */
        function getOrCreateMonthData() {
            const selectedMonth = parseInt(monthSelect.value);
            const selectedYear = parseInt(yearSelect.value);
            const monthYearKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

            if (!plannerData[currentTeam].dailyEntries[monthYearKey]) {
                // Inicializa os dados para este mês/ano se não existirem
                plannerData[currentTeam].dailyEntries[monthYearKey] = {
                    notes: Array(15).fill(''), // 15 notas por mês
                    goals: '',
                    observation: '',
                    days: [] // Entradas diárias
                };
            }
            return plannerData[currentTeam].dailyEntries[monthYearKey];
        }

        /**
         * Atualiza a interface do usuário com os dados da equipe e do mês/ano atualmente ativos.
         */
        function updateUI() {
            const activeMonthData = getOrCreateMonthData();

            // Atualiza o banner superior com o nome de exibição correto
            teamNameDisplay.textContent = teamDisplayNames[currentTeam];

            // Limpa e recria os campos de Anotações Importantes
            notesContainer.innerHTML = '';
            for (let i = 0; i < 15; i++) {
                const noteDiv = document.createElement('div');
                noteDiv.contentEditable = true;
                noteDiv.className = 'editable-text bg-blue-50 rounded-md';
                noteDiv.dataset.noteIndex = i;
                noteDiv.textContent = activeMonthData.notes[i] || ''; // Garante que o texto seja carregado
                noteDiv.addEventListener('input', (event) => {
                    const index = parseInt(event.target.dataset.noteIndex);
                    activeMonthData.notes[index] = event.target.textContent;
                });
                notesContainer.appendChild(noteDiv);
            }

            // Atualiza Metas
            goalsText.textContent = activeMonthData.goals;

            // Atualiza Observação
            observationText.textContent = activeMonthData.observation;

            // Re-renderiza o calendário para exibir as entradas diárias corretas
            renderCalendar();
        }

        /**
         * Preenche o seletor de ano com um intervalo de anos.
         */
        function populateYearSelect() {
            const currentYear = new Date().getFullYear();
            for (let i = currentYear - 5; i <= currentYear + 5; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                if (i === currentYear) {
                    option.selected = true;
                }
                yearSelect.appendChild(option);
            }
        }

        /**
         * Renderiza o calendário com os dias do mês e entradas diárias.
         */
        function renderCalendar() {
            const selectedMonth = parseInt(monthSelect.value);
            const selectedYear = parseInt(yearSelect.value);
            const activeMonthData = getOrCreateMonthData(); // Obtém os dados do mês/ano
            const currentMonthDailyEntries = activeMonthData.days; // Agora 'days' é o array de entradas diárias

            calendarGrid.innerHTML = ''; // Limpa as células anteriores

            // Calcula o primeiro dia da semana do mês (0=Domingo, 1=Segunda...)
            const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
            // Ajusta para que Segunda-feira seja o primeiro dia (índice 0)
            const firstDayAdjusted = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

            // Obtém o número de dias no mês
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

            // Adiciona células vazias para os dias antes do 1º do mês
            for (let i = 0; i < firstDayAdjusted; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-cell relative opacity-50'; // Células vazias menos proeminentes
                calendarGrid.appendChild(emptyCell);
            }

            // Adiciona células para cada dia do mês
            for (let day = 1; day <= daysInMonth; day++) {
                const cell = document.createElement('div');
                let cellClasses = 'calendar-cell relative';
                let holidayName = '';

                // Verifica se o dia atual é um feriado nacional
                const isHoliday = nationalHolidays.find(holiday =>
                    holiday.month === selectedMonth && holiday.day === day
                );

                if (isHoliday) {
                    cellClasses += ' holiday-cell'; // Adiciona estilo específico de feriado
                    holidayName = `<div class="holiday-name">${isHoliday.name}</div>`;
                }

                cell.className = cellClasses;
                // Obtém o texto salvo para este dia, ou uma string vazia
                // Garante que o array `days` tenha tamanho suficiente
                if (currentMonthDailyEntries.length < day) {
                    currentMonthDailyEntries.length = day; // Expande o array se necessário
                }
                const dailyEntryText = currentMonthDailyEntries[day - 1] || '';

                cell.innerHTML = `
                    <span class="day-number">${day}</span>
                    ${holidayName}
                    <div contenteditable="true" class="editable-text mt-6 flex-grow" data-day="${day}"></div>
                `;
                calendarGrid.appendChild(cell);

                // Define o conteúdo de texto e adiciona o listener de input
                const editableDiv = cell.querySelector('.editable-text');
                if (editableDiv) {
                    editableDiv.textContent = dailyEntryText;
                    editableDiv.addEventListener('input', (event) => {
                        const dayIndex = parseInt(event.target.dataset.day) - 1;
                        currentMonthDailyEntries[dayIndex] = event.target.textContent;
                    });
                }
            }

            // Adiciona células vazias para completar a última linha
            const totalCells = firstDayAdjusted + daysInMonth;
            const remainingCells = (7 - (totalCells % 7)) % 7;
            for (let i = 0; i < remainingCells; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-cell relative opacity-50';
                calendarGrid.appendChild(emptyCell);
            }
        }

        /**
         * Alterna entre as equipes 'tarde' e 'manha'.
         */
        function toggleTeam() {
            currentTeam = (currentTeam === 'tarde') ? 'manha' : 'tarde';
            console.log("Alternado para a equipe:", currentTeam);
            updateUI(); // Atualiza a UI para a nova equipe e mês/ano
        }

        // --- Listeners de Eventos ---

        // Listener para o clique no banner superior para alternar equipes
        teamToggleBanner.addEventListener('click', toggleTeam);

        // Listeners para mudanças nos seletores de mês e ano
        monthSelect.addEventListener('change', updateUI);
        yearSelect.addEventListener('change', updateUI);

        // Listeners para input nas seções de metas e observação
        goalsText.addEventListener('input', (event) => {
            const activeMonthData = getOrCreateMonthData();
            activeMonthData.goals = event.target.textContent;
        });

        observationText.addEventListener('input', (event) => {
            const activeMonthData = getOrCreateMonthData();
            activeMonthData.observation = event.target.textContent;
        });

        // --- Inicialização ---

        // Define o mês e ano atuais como padrão nos seletores
        const today = new Date();
        monthSelect.value = today.getMonth().toString(); // getMonth() retorna 0-11
        yearSelect.value = today.getFullYear().toString();

        // Preenche o seletor de ano ao carregar
        populateYearSelect();

        // Renderiza a UI inicial
        updateUI();