document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, starting application");

    // Load JSON data
    $.getJSON($("main").data("content"), function(data) {
        console.log("JSON data loaded:", data);

        const lang = data.project.lang || 'pt';
        const showDetailed = data.project["show-detailed"] || false;

        console.log("Language:", lang, "Show detailed:", showDetailed);

        // Set page language and meta data
        $("html").attr("lang", lang);
        $('meta[name="language"]').attr("content", lang);
        $("title.seo-title").text(data.traducoes["seo-title"][lang]);
        $("meta.seo-title").attr("content", data.traducoes["seo-title"][lang]);
        $("meta.seo-description").attr("content", data.traducoes["seo-description"][lang]);
        $('meta[name="keywords"]').attr("content", data.traducoes["seo-keywords"][lang]);

        // Update page content
        $(".title").html(data.traducoes.title[lang]);
        $(".subtitle").html(data.traducoes.subtitle[lang]);
        $(".intro").html(data.traducoes.intro[lang]);
        $(".escolha-pagamento").html(data.traducoes["escolha-pagamento"][lang]);
        $(".cobrancas-mensais").html(data.traducoes["cobrancas-mensais"][lang]);
        $(".cobranca-anual").html(data.traducoes["cobranca-anual"][lang]);

        // Process plans
        if (data.plans && data.plans.length > 0) {
            console.log("Processing", data.plans.length, "plans");

            data.plans.forEach(function(plan, index) {
                console.log("Creating plan:", plan.title[lang]);

                let article = '<article';
                if (plan.popular) {
                    article += ' class="popular"';
                }
                article += '>';

                // Title
                article += '<h2>' + plan.title[lang] + '</h2>';

                // Price
                article += '<p class="price">';
                article += '<strong data-mes="' + plan.price.mes + '" data-ano="' + plan.price.ano + '">';
                article += '€' + plan.price.mes + '</strong>';
                article += '<small data-mes="/' + data.traducoes.mes[lang] + '" data-ano="/' + data.traducoes.ano[lang] + '">';
                article += '/' + data.traducoes.mes[lang] + '</small>';
                article += '</p>';

                // Description
                if (plan.description && plan.description[lang]) {
                    article += '<p>' + plan.description[lang] + '</p>';
                }

                // Subtitle (if not showing detailed)
                if (!showDetailed && plan.subtitle && plan.subtitle[lang]) {
                    article += '<h3>' + plan.subtitle[lang] + '</h3>';
                }

                // Add included services list
                data.services.forEach(function(group) {
                    var features = group.services.filter(function(svc) {
                        return svc.plans.indexOf(plan.id) !== -1;
                    });
                    if (features.length) {
                        article += '<h4>' + group.title[lang] + '</h4><ul>';
                        features.forEach(function(svc) {
                            article += '<li>' + svc.description[lang] + '</li>';
                        });
                        article += '</ul>';
                    }
                });

                article += '</article>';

                // Append to plans section
                $("section.plans").append(article);
                console.log("Plan", index + 1, "added to DOM");
            });

            console.log("All plans processed and added to DOM");
        } else {
            console.log("No plans data found");
        }

        // Handle payment toggle
        $(document).on("click touch", "ul.pagamento button", function() {
            if (!$(this).hasClass("active")) {
                $("ul.pagamento button").removeClass("active");
                $(this).addClass("active");

                const paymentType = $(this).data("pagamento");
                console.log("Payment type changed to:", paymentType);

                $("section.plans article").each(function() {
                    const priceElement = $("p.price strong", this);
                    const smallElement = $("p.price small", this);

                    if (paymentType === "ano" && parseInt(priceElement.data("mes")) * 12 !== parseInt(priceElement.data("ano"))) {
                        const discount = Math.floor(100 - (100 * priceElement.data("ano") / (12 * priceElement.data("mes"))));
                        const savingsText = '<span>-' + discount + '%</span> <del>€' + (12 * priceElement.data("mes")) + '</del>';
                        priceElement.text('€' + priceElement.data("ano"));
                        smallElement.html('/' + data.traducoes.ano[lang] + ' ' + savingsText);
                    } else {
                        priceElement.text('€' + priceElement.data("mes"));
                        smallElement.html('/' + data.traducoes.mes[lang]);
                    }
                });
            }
        });

        // Handle details button clicks
        $(document).on("click touch", "article button.details", function() {
            $("table.details")[0].scrollIntoView({behavior: "smooth", block: "start"});
        });

        // Handle FAQ interactions
        $(document).on("click touch", "section.faqs button", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(this).next().slideUp("fast");
            } else {
                $(this).addClass("active");
                $(this).next().slideDown("fast");
            }
        });

        // Handle table interactions
        $(document).on("click touch", "table button", function() {
            const area = $(this).data("area");
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $('table tbody tr[data-child="' + area + '"]').addClass("hidden");
            } else {
                $(this).addClass("active");
                $('table tbody tr[data-child="' + area + '"]').removeClass("hidden");
            }
        });

        // Handle tooltip interactions
        $(document).on("mouseenter mousemove", "svg.tooltip", function() {
            $(this).next().addClass("show");
        }).on("mouseleave", "svg.tooltip", function() {
            $(this).next().removeClass("show");
        });

        // Handle table cell hover effects
        $(document).on("mouseenter mousemove", "table th, table td", function() {
            const index = $(this).index();
            if (index !== 0) {
                $("table th:nth-child(" + (index + 1) + "), table td:nth-child(" + (index + 1) + ")").addClass("active");
            }
        }).on("mouseleave", "table th, table td", function() {
            const index = $(this).index();
            if (index !== 0) {
                $("table th:nth-child(" + (index + 1) + "), table td:nth-child(" + (index + 1) + ")").removeClass("active");
            }
        });

        console.log("Application initialization complete");
        $("body").removeClass("loading");

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to load JSON data:", textStatus, errorThrown);
        console.error("Response:", jqXHR.responseText);
    });
});
