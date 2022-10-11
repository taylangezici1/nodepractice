const dict = {a:{innerA:1},b:{innerB:2},c:{innerC:3}}

// for (key in dict){
    
//     console.log(dict[key])
// }

for ([key,value] of Object.entries(dict)){
    console.log(value)
}