# Usa l'immagine ufficiale Ruby pi� recente come base.
FROM ruby:latest

# Imposta le variabili d'ambiente per Bundler
# Questo è cruciale per la persistenza delle gemme e la gestione del PATH
ENV BUNDLE_PATH /usr/local/bundle
ENV PATH $BUNDLE_PATH/bin:$PATH

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Installa le dipendenze di sistema richieste da Jekyll e GitHub Pages.
# Ho aggiunto un set completo di dipendenze comuni.
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    build-essential \
    nodejs \
    yarn \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libssl-dev \
    cmake \
    git \
    pkg-config # Aggiunto pkg-config, a volte utile per compilazione

# Copia il Gemfile e Gemfile.lock (se presente)
# Questo deve avvenire PRIMA di bundle install per ottimizzare la cache

COPY Gemfile Gemfile.lock ./

# Installa le gemme. Bundler userà BUNDLE_PATH per l'installazione.
RUN bundle install --jobs 4 --retry 3

# Copia il resto del tuo codice sorgente nel container
COPY . /app

# Specifica la porta su cui Jekyll gira di default
EXPOSE 4000

# Comando di default quando il container viene avviato.
# Usiamo 'bundle exec' per assicurarci che Jekyll sia nel PATH corretto.
CMD ["bundle", "exec", "jekyll", "serve", "--force_polling", "--incremental", "--host", "0.0.0.0"]