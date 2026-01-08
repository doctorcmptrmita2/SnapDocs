 abs.domaina.com


subdomainini;


domainb.com a nasıl ynlendirriiz ssl de olacak ?

Bir subdomain'i (abs.domaina.com), başka bir ana domaine (domainb.com) SSL sertifikasını koruyarak yönlendirmenin en sağlıklı yolları şunlardır:
1. Yöntem: Cloudflare Kullanarak (En Kolay ve Ücretsiz)

Eğer DNS yönetimi için Cloudflare kullanıyorsanız veya kullanma imkanınız varsa, bu işlem hem ücretsizdir hem de SSL karmaşasını otomatik çözer.

    DNS Kaydı: Cloudflare panelinde domaina.com ayarlarına gidin. abs isminde bir CNAME kaydı oluşturun ve hedef olarak domainb.com adresini yazın. Bulut (Proxy) simgesinin turuncu (aktif) olduğundan emin olun.

    Page Rules / Redirect Rules: * "Rules" (Kurallar) sekmesine gidin.

        Create Rule diyerek şu kuralı ekleyin:

            If URL matches: abs.domaina.com/*

            Setting: Forwarding URL (301 - Permanent Redirect)

            Destination URL: https://domainb.com/$1

    SSL: Cloudflare'in "Edge Certificates" özelliği sayesinde hem eski hem yeni adresinizde SSL otomatik olarak çalışacaktır.

2. Yöntem: Nginx veya Apache Üzerinden (Kendi Sunucunuz Varsa)

Eğer domaina.com için bir VPS veya sunucu yönetiyorsanız, konfigürasyon dosyası üzerinden yönlendirme yapabilirsiniz. Bu yöntemde her iki domain için de sunucuda SSL sertifikası kurulu olmalıdır.

Nginx için:
Nginx

server {
    listen 80;
    listen 443 ssl;
    server_name abs.domaina.com;

    # SSL Sertifika yollarınız (Let's Encrypt vb.)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    return 301 https://domainb.com$request_uri;
}

Apache (.htaccess) için: abs.domaina.com'un bağlı olduğu kök dizine bir .htaccess dosyası oluşturun:
Apache

RewriteEngine On
RewriteCond %{HTTP_HOST} ^abs\.domaina\.com$ [NC]
RewriteRule ^(.*)$ https://domainb.com/$1 [L,R=301]

3. Yöntem: Hosting Paneli (cPanel/Plesk) Üzerinden

Sunucu yönetimiyle uğraşmak istemiyorsanız:

    cPanel: "Redirects" (Yönlendirmeler) bölümüne gidin.

    abs.domaina.com adresini seçin.

    "Redirects to" kısmına https://domainb.com yazın.

    Kritik Nokta: Yönlendirmenin SSL hatası vermemesi için abs.domaina.com üzerinde geçerli bir SSL sertifikası (Let's Encrypt gibi ücretsiz bir sertifika yeterlidir) kurulu olmalıdır.

Dikkat Etmeniz Gerekenler (Özet)

    SSL Sertifikası: Yönlendirme işlemi yapılmadan önce, tarayıcı ilk olarak https://abs.domaina.com adresine bağlanmaya çalışır. Eğer bu subdomain üzerinde bir SSL sertifikası yoksa, kullanıcı "Bağlantınız gizli değil" uyarısı alır ve yönlendirme gerçekleşmez. Bu yüzden önce SSL kurup sonra yönlendirmeyi aktif etmelisiniz.

    DNS Yayılması: DNS kayıtlarında yaptığınız değişikliklerin aktif olması 1-24 saat sürebilir.

    301 vs 302: Eğer bu kalıcı bir yönlendirme ise (SEO açısından önerilen) mutlaka 301 yönlendirmesini kullanın.


