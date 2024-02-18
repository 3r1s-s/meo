var plugins = ""

var start = async function() {
    plugins = await window.fetchplugins()

    var turnsrc = ""
    for (let i = 0; i < plugins.length; i++) {
        if (plugins[i].name == "Meower Turn") {
            turnsrc = plugins[i].script
        }
    }

    document.documentElement.style.transform = `perspective(500px) scale(0.5)`
    document.documentElement.style.width = "100%"
    document.documentElement.style.height = "100%"
    document.documentElement.style.position = "fixed"
    document.documentElement.style.overflow = "hidden"

    function moveevent(event) {
        document.documentElement.style.transform = `perspective(500px) rotateX(${(event.pageY-(window.innerHeight/2)) / 6}deg) rotateY(${(event.pageX-(window.innerWidth/2)) / 6}deg) scale(0.5)`
        document.documentElement.style.width = "100%"
        document.documentElement.style.height = "100%"
        document.documentElement.style.position = "fixed"
        document.documentElement.style.overflow = "hidden"
    }

    document.addEventListener("mousemove", moveevent);

    let reloading = false

    await new Promise(r => setTimeout(r, 500));

    var tcheck = setInterval(turncheck, 100);

    function turncheck() {
        for (let i2 = 0; i2 < document.getElementsByTagName("script").length; i2++) {
            if (!reloading) {
                if (document.getElementsByTagName("script")[i2].src == turnsrc) {
                    reloading = true
                    alert("Meower rotate doesnt work with meower turn, pressing ok will disable meower turn and reload")
                    localStorage.removeItem("Meower Turn")
                    window.location.reload()
                }
            }
        }

        if (!localStorage.getItem("Meower Rotate")) {
            document.removeEventListener("mousemove", moveevent)
            clearInterval(tcheck)
            document.documentElement.style.transform = null
            document.documentElement.style.width = null
            document.documentElement.style.height = null
            document.documentElement.style.position = null
            document.documentElement.style.overflow = null
        }
    }
}
  
// Call start
start();