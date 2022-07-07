document.getElementById("searchwiki").addEventListener("keyup", (e) => {

    searchword = e.target.value;

    if(searchword.trim().length > 0){
        fetch('http://localhost:8000/wiki/search/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "searchword": searchword }),
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector(".searchwiki_list").innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
    }
    // 입력값 없을 때 검색목록 사라지게
    else{
        document.querySelector(".searchwiki_list").innerHTML = "";
    }
});
