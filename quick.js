list = [0, "q", "K"]

console.log("t".toUpperCase());

for (let i = 0; i < list.length; i++) {
    let item = list[i];
    if (typeof item === "string") {
        if (item == item.toUpperCase()) {
            item = item.toLowerCase();
        } else if (item == item.toLowerCase()) {
            item = item.toUpperCase();
        }
    }
    list[i] = item
}

console.log(list);