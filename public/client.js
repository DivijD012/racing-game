import * as THREE from 'three'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './jsm/controls/OrbitControls.js'

var health_bar = document.getElementById("health");
var fuel_tank = document.getElementById("fuel");
var time_board = document.getElementById("time");
var score_board = document.getElementById("score");
var distance_next = document.getElementById("distance");
var mileage_bar = document.getElementById("mileage");


var fuel_value = 100;
var insetHeight = window.innerHeight/6;
var insetWidth = window.innerWidth/6;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
var topCamera = new THREE.PerspectiveCamera(
    75,
    insetWidth / insetHeight,
    0.1,
    1000
);
var firstCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const loader = new GLTFLoader()
var mcqueen;
loader.load(
  './assets/mcqueen/scene.gltf',
  function (gltf) {
    mcqueen = gltf.scene
    gltf.scene.translateZ(0)
    gltf.scene.translateX(320)
    gltf.scene.translateY(20)
    gltf.scene.translateZ(0.3)
    gltf.scene.rotateX(Math.PI / 2)
    gltf.scene.rotateY(-Math.PI)
    scene.add(gltf.scene)
    mcqueen.getWorldDirection(cameraDirection)
    firstCamera.position.x = mcqueen.position.x;
    firstCamera.position.y = mcqueen.position.y;
    firstCamera.position.z = mcqueen.position.z + 5;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  function (error) {
    console.error(error)
  }
)
loader.load(
    './assets/stadium/scene.gltf',
    function (gltf) {
      gltf.scene.rotateX(Math.PI / 2)
      gltf.scene.scale.set(10, 10, 10)
      gltf.scene.translateY(-8)

      scene.add(gltf.scene)
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    function (error) {
      console.error(error)
    }
  )
// camera.position.z = 20;
var LastPosition = new THREE.Vector3();

// var LastDirection = new THREE.Vector3();
var Last2Position = new THREE.Vector3();

var cameraDirection = new THREE.Vector3();
var Speed = 0;
var rSpeed = 0.5;
var rotaSpeed = 0;
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#87ceeb");
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry(2, 2, 2);
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 20, 10);
const ambient = new THREE.AmbientLight(0x707070);

const controls = new OrbitControls(camera, renderer.domElement)

// const material = new THREE.MeshPhongMaterial({ color: 0x00aaff });
camera.position.set(300, 0, 15);
// camera.lookAt(0, 1, 0);
// camera.up.set(0, 0, 1);
camera.rotation.x = Math.PI/2;
firstCamera.rotation.x = Math.PI/2;
firstCamera.up.set(0, 0, 1);
topCamera.position.set(320, 15, 100);
// cube = new THREE.Mesh(geometry, material);
const ring = new THREE.RingGeometry(100, 400, 200);
const ring_material = new THREE.MeshPhongMaterial({ color: 0x5a5a5a });
var mesh = new THREE.Mesh(ring, ring_material);
const grass = new THREE.CircleGeometry(100, 200);
const grass_material = new THREE.MeshPhongMaterial({color: 0x00ff00});
var grassmesh = new THREE.Mesh(grass, grass_material);
const grass2 = new THREE.RingGeometry(400, 450, 200);
var grassmesh2 = new THREE.Mesh(grass2, grass_material);
const sitting_place_1 = new THREE.RingGeometry(450, 500, 200);
const sitting_place_material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
var sitting_place_1_mesh = new THREE.Mesh(sitting_place_1, sitting_place_material);
const audience = [];
for(let i=0;i<30;i++)
{
    let theta = i*Math.PI*2/30;
    let distance = Math.floor((Math.random() * 40) + 1);
    distance += 450;
    loader.load(
        './assets/fall/scene.gltf',
        function (gltf) {
          audience[i] = gltf.scene
          gltf.scene.translateZ(10)
          audience[i].translateX(Math.cos(theta)*distance);
          audience[i].translateY(Math.sin(theta)*distance);
          
          audience[i].scale.set(5, 5, 5);
          audience[i].rotateZ(-Math.PI/2);
          audience[i].rotateX(Math.PI/2);
          audience[i].rotateY(theta)
          scene.add(gltf.scene)
        },
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        function (error) {
          console.error(error)
        }
      )
}

const fuel = []
const fuel_mesh = []
var fuel_picked = [0, 0, 0, 0, 0]
var fuel_active = [0, 1, 0, 0, 0]
var check_point = [0, 0, 0, 0, 0];
var distance_fuel = []
var active_fuel_tank = 1;

for(let i = 0;i<5;i++)
{
    let theta = i*Math.PI*2/5;
    distance_fuel[i] = Math.random() * 100;
    distance_fuel[i] += 200;
    fuel[i] = new THREE.SphereGeometry(5, 200, 200);
    fuel[i].translate(Math.cos(theta)*distance_fuel[i], Math.sin(theta)*distance_fuel[i], 5);
    fuel_mesh[i] = new THREE.Mesh(fuel[i], sitting_place_material);
}
var lap = [0, 0, 0];
var current_lap = 0;
var grace_bool = [0, 0, 0]
var opp_car = [];
const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
for(let i=0;i<3;i++)
{
    opp_car[i] = new THREE.Group();
    let fr_wheel = new THREE.SphereGeometry(1.5, 200, 200);
    let fr_mesh = new THREE.Mesh(fr_wheel, material);
    let br_wheel = new THREE.SphereGeometry(1.5, 200, 200);
    let br_mesh = new THREE.Mesh(br_wheel, material);
    let bl_wheel = new THREE.SphereGeometry(1.5, 200, 200);
    let bl_mesh = new THREE.Mesh(bl_wheel, material);
    let fl_wheel = new THREE.SphereGeometry(1.5, 200, 200);
    let fl_mesh = new THREE.Mesh(fl_wheel, material);
    fr_mesh.position.set(5, 8, 0.6);
    br_mesh.position.set(5, -8, 0.6);
    bl_mesh.position.set(-5, -8, 0.6);
    fl_mesh.position.set(-5, 8, 0.6);
    opp_car[i].add(fr_mesh)
    opp_car[i].add(fl_mesh)
    opp_car[i].add(bl_mesh)
    opp_car[i].add(br_mesh)
    var main_body
    if(i == 0)
    {
        main_body = new THREE.Mesh(
            new THREE.BoxGeometry(12, 20, 5),
            new THREE.MeshLambertMaterial({ color: 0x78b14b })
        );
    }
    else if(i == 1)
    {
        main_body = new THREE.Mesh(
            new THREE.BoxGeometry(12, 20, 5),
            new THREE.MeshLambertMaterial({ color: 0x7393B3 })
        );
    }
    else
    {
        main_body = new THREE.Mesh(
            new THREE.BoxGeometry(12, 20, 5),
            new THREE.MeshLambertMaterial({ color: 0x880808 })
        );
    }
    main_body.position.z = 4;
    opp_car[i].add(main_body);
    let cabin = new THREE.Mesh(
        new THREE.BoxGeometry(9, 10, 4),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
    cabin.position.y = -3;
    cabin.position.z = 8.5;
    opp_car[i].add(cabin);
    // opp_car[i].scale.set(0.7, 0.7);
    scene.add(opp_car[i]);
}
var opp_car_theta = [0, 0, 0]
var opp_car_radius = [130, 180, 240]
var opp_car_speed = [0.17, 0.2, 0.22]
var opp_car_frames = [0, 0, 0]
var opp_direction = [0, 0, 0]
opp_car[0].position.x = opp_car_radius[0];
opp_car[1].position.x = opp_car_radius[1];
opp_car[2].position.x = opp_car_radius[2];
var opp_car_checkpoint = [[0,0],[0,0],[0,0]];
var opp_car_stop = [0,0,0]
var opp_car_health = [60, 100, 80]

scene.add(fuel_mesh[1]);
scene.add(sitting_place_1_mesh);
scene.add(grassmesh);
scene.add(grassmesh2);
scene.add(mesh);
scene.add(camera);
// scene.add(cube);
scene.add(light);
scene.add(ambient);
var whichCamera= 0;
var collision_stop = -1;
var end_game = 0;
var game_stuck = 1;
var distance_next_value = 0;
var health_bar_value = 100;
var start = Date.now()
var increaseSpeed = 0;
var total_distance_covered = 0;
var total_fuel_consumed = 0;

health_bar.innerHTML = "HEALTH : 100";
fuel_tank.innerHTML = "FUEL : " + fuel_value;
time_board.innerHTML = "TIME : 0.00"
score_board.innerHTML = "SCORE : 0"
distance_next.innerHTML = "NEXT FUEL TANK IN : "
mileage_bar.innerHTML = "Mileage : "

window.addEventListener("keyup", () => onDocumentKeyUp(), true);
window.addEventListener("keydown", () => onDocumentKeyDown(), true);

window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        insetHeight = window.innerHeight/6;
        insetWidth = window.innerWidth/6;
        topCamera.aspect = insetWidth/insetHeight;
        topCamera.updateProjectionMatrix()
        render()
    },
    false
)
function onDocumentKeyDown() {
    mcqueen.getWorldDirection(cameraDirection);
    let keyCode = event.key;
    if(keyCode == 't' || keyCode == 'T')
    {
        whichCamera+=1;
        whichCamera%=2;
        setTimeout(() => {  console.log("Changing camera"); }, 50);
    }
    // console.log(cameraDirection);
    if(keyCode == 'w' || keyCode == 'W') {
        increaseSpeed = 0.002;
    }
    if(keyCode == 's' || keyCode == 'S') {
        increaseSpeed = -0.001;
    }
    if(keyCode == 'a' || keyCode == 'A') {
        rotaSpeed = Math.PI/450;
    }
    if(keyCode == 'd' || keyCode == 'D') {
        rotaSpeed = -Math.PI/450;
    }
    if((keyCode == 'p' || keyCode == 'P') && game_stuck == 1)
    {
        game_stuck = 0;
        document.getElementById("start_screen").innerHTML = ""
    }
}

function onDocumentKeyUp() {
    let keyCode = event.key;
    // console.log(cameraDirection);
    if((keyCode == 'w' || keyCode == 'W') && increaseSpeed > 0) {
        increaseSpeed = 0;
    }
    if((keyCode == 's' || keyCode == 'S') && increaseSpeed < 0) {
        increaseSpeed = 0;
    }
    if(keyCode == 'a' || keyCode == 'A') {
        rotaSpeed = 0;
    }
    if(keyCode == 'd' || keyCode == 'D') {
        rotaSpeed = 0;
    }
}

function checkCarCollision()
{
    for(let i = 0;i<3;i++)
    {
        // console.log("COLLISION DETECTED : " + i);
        let distCar = Math.sqrt(Math.pow(mcqueen.position.x - Math.cos(opp_car_theta[i]*Math.PI/180)*opp_car_radius[i], 2) + Math.pow(mcqueen.position.y - Math.sin(opp_car_theta[i]*Math.PI/180)*opp_car_radius[i], 2));
        if(distCar <= 15 && grace_bool[i] == 0)
        {
            Speed = 0;
            health_bar_value -= 20;
            opp_car_health[i] -= 20;
            collision_stop = i+1;
            setTimeout(() => {
                console.log(collision_stop);
                grace_bool[collision_stop - 1] = 1;
                collision_stop = 0;
            }, 700);
            setTimeout(() => {
                console.log("This was called");
                console.log(collision_stop);
                grace_bool = [0, 0, 0]
                for(let k = 0;k<3;k++)
                {
                    if(opp_car_health[k] <= 0)
                        grace_bool[k] = 1;
                }
                // if(LastPositionArray[0].x != 0 || LastPositionArray[0].y != 0 || LastPositionArray[0].z != 0)
                // {
                //     mcqueen.position.x = LastPositionArray[0].x;
                //     mcqueen.position.y = LastPositionArray[0].y;
                //     mcqueen.position.z = LastPositionArray[0].z;
                // }
                // else
                // {
                //     mcqueen.position.x = 320;
                //     mcqueen.position.y = 20;
                // }
                // firstCamera.position.x = mcqueen.position.x;
                // firstCamera.position.y = mcqueen.position.y;
                // camera.lookAt(mcqueen.position)
                // camera.up.set(0, 0, 1);
                // camera.position.x = mcqueen.position.x - cameraDirection.x*20;
                // camera.position.y = mcqueen.position.y - cameraDirection.y*20;
                // topCamera.position.x = mcqueen.position.x + cameraDirection.x*20;
                // topCamera.position.y = mcqueen.position.y + cameraDirection.y*20;
                collision_stop = -1;
            }, 1200);
        }
    }
}

function animate() {
    if(end_game == 1)
    {
        console.log("Game Ended")
        return;
    }
    requestAnimationFrame(animate)
    if(fuel_value < 0)
    {
        renderer.clear()
        health_bar.innerHTML = ""
        fuel_tank.innerHTML = ""
        time_board.innerHTML = ""
        score_board.innerHTML = ""
        distance_next.innerHTML = ""
        document.getElementById("start_screen").innerHTML = "PLAYER OUT OF FUEL <br><br> GAME OVER";
        return;
    }
    if(health_bar_value == 0)
    {
        renderer.clear()
        health_bar.innerHTML = ""
        fuel_tank.innerHTML = ""
        time_board.innerHTML = ""
        score_board.innerHTML = ""
        distance_next.innerHTML = ""
        document.getElementById("start_screen").innerHTML = "YOUR CAR CAN'T TAKE IT ANYMORE <br><br> GAME OVER";
        return;
    }
    if(collision_stop < 0 && !game_stuck)
        checkCarCollision();
    for(let i = 0;i<3;i++)
    {
        if(collision_stop == i+1)
            continue;
        if(opp_car_stop[i] > 0)
            continue;
        if(opp_car_health[i] <= 0)
        {
            continue;
        }
            if(opp_car_frames[i] == 0 && i == 2)
        {
            opp_car_frames[i] = Math.floor((Math.random() * 100) + 1) + 40;
            opp_direction[i] = Math.random()
            if(opp_direction[i] < 0.5)
                opp_direction[i] = -1;
            else
                opp_direction[i] = 1;
            if(opp_car_radius[i] < 160)
                opp_direction[i] = 1;
            else if(opp_car_radius > 280)
                opp_direction[i] = -1;    
        }
        else if(opp_car_frames[i] == 0 && i == 0)
        {
            opp_car_speed[i] = Math.random()/10 + 0.17;
            if(opp_car_speed[i] > 0.23)
                opp_car_speed[i] = 0.23;
        }
        if(!game_stuck)
        {
            opp_car_theta[i] += opp_car_speed[i];
            opp_car_theta[i] %= 360;
        }
        if(!game_stuck && (opp_car_radius[i] > 210 && opp_car_radius[i] < 380) || (opp_car_radius[i] >= 380 && opp_direction[i] == -1) || (opp_car_radius[i] <= 210 && opp_direction[i] == 1))
            opp_car_radius[i] += opp_direction[i]*0.4;
        if(!game_stuck)
        {
            opp_car[i].position.x = Math.cos(Math.PI*opp_car_theta[i]/180)*opp_car_radius[i];
            opp_car[i].position.y = Math.sin(Math.PI*opp_car_theta[i]/180)*opp_car_radius[i];
            opp_car[i].rotation.z += opp_car_speed[i]*Math.PI/180;
            opp_car_frames[i]--;
        }
        // console.log(opp_car_theta[i]);
        for(let j=0;j<2;j++)
        {
            if(j == 1 && opp_car_checkpoint[i][j] == opp_car_checkpoint[i][j-1] && (opp_car_theta[i] <= 185 && opp_car_theta[i] >= 175))
            {   
                opp_car_checkpoint[i][j]++;
                console.log("Car : " + i + "Point : " + j + "Value : " + opp_car_checkpoint[i][j]);
            }
            else if(j == 0 && opp_car_checkpoint[i][j] == (opp_car_checkpoint[i][j+1] - 1) && (opp_car_theta[i] <= 5 || opp_car_theta[i] >= 355))
            {
                opp_car_checkpoint[i][j]++;
                console.log("Car : " + i + "Point : " + j + "Value : " + opp_car_checkpoint[i][j]);
            }
        }
        if(opp_car_checkpoint[i][0] == 3 && opp_car_stop[i] == 0)
        {
            grace_bool[i] = 1;
            opp_car_stop[i] = (Date.now() - start)/1000;
            console.log(opp_car_stop[i])
        }
    }
    var cameraDistance = mcqueen.position.x*mcqueen.position.x + mcqueen.position.y*mcqueen.position.y;
    if(cameraDistance >= 11000 && cameraDistance <= 400*400 - 10000 && collision_stop < 0)
    {
        if(!game_stuck)
        {   
            // console.log(increaseSpeed)
            if(increaseSpeed > 0)
            {   
                if(Speed < 0)
                {
                    Speed += 0.003;
                }
                total_fuel_consumed += 0.075
                fuel_value -= 0.075;
                // console.log("INCREASING SPEED")
                if(Speed < -0.5)
                    Speed +=increaseSpeed * 6;
                else if(Speed < -0.2)
                    Speed +=increaseSpeed * 4;
                else if(Speed < 0)
                    Speed += increaseSpeed * 2;
                else if(Speed < 0.4)
                    Speed += increaseSpeed * 5;
                else if(Speed < 0.7)
                    Speed += increaseSpeed * 3;
                else if(Speed < 1.2)
                    Speed += increaseSpeed;
                else if(Speed < 1.5)
                    Speed += increaseSpeed/5;
            }
            else if(increaseSpeed < 0)
            {    
                total_fuel_consumed += 0.075
                fuel_value -= 0.075;
                if(Speed > 0)
                {
                    Speed -= 0.003;
                }
                // console.log("DECREASING SPEED")
                if(Speed > 0.5)
                    Speed += increaseSpeed * 7;
                else if(Speed > 0.2)
                    Speed += increaseSpeed * 4;
                else if(Speed > 0)
                    Speed += increaseSpeed * 2;
                else if(Speed > -1)
                    Speed += increaseSpeed;
            }
            else if(Speed != 0)
            {
                if(Speed > 0)
                {
                    Speed -= 0.003;
                }
                else if(Speed < 0)
                {
                    Speed += 0.003;
                }
            }
            mcqueen.position.x += Speed*cameraDirection.x
            mcqueen.position.y += Speed*cameraDirection.y
            total_distance_covered += Math.sqrt(Math.pow(Speed*cameraDirection.x, 2) + Math.pow(Speed*cameraDirection.y, 2))
        }
        camera.lookAt(mcqueen.position)
        camera.up.set(0, 0, 1);
        camera.position.x = mcqueen.position.x - cameraDirection.x*20;
        camera.position.y = mcqueen.position.y - cameraDirection.y*20;
        topCamera.position.x = mcqueen.position.x + cameraDirection.x*20;
        topCamera.position.y = mcqueen.position.y + cameraDirection.y*20;
        firstCamera.position.x = mcqueen.position.x;
        firstCamera.position.y = mcqueen.position.y;
        if((Speed >= 0.001 || Speed <= -0.001) && !game_stuck)
        {
            if(Speed > 0 && Speed < 0.7)
            {
                mcqueen.rotation.y -= rotaSpeed*(3 - Math.abs(Speed))/2;
                firstCamera.rotation.y += rotaSpeed*(3 - Math.abs(Speed))/2;
            }
            else if(Speed > 0)
            {
                let newSpeed = Speed;
                if(newSpeed > 1.2)
                    newSpeed = 1.2;
                mcqueen.rotation.y -= rotaSpeed*(2.5 - Math.abs(newSpeed))/2;
                firstCamera.rotation.y += rotaSpeed*(2.5 - Math.abs(newSpeed))/2;
            }
            else if(Speed < 0)
            {
                mcqueen.rotation.y -= rotaSpeed*(1.5 - Math.abs(Speed))/2;
                firstCamera.rotation.y += rotaSpeed*(1.5 - Math.abs(Speed))/2;
            }
            mcqueen.getWorldDirection(cameraDirection);
        }
    }
    else if(collision_stop < 0 && !game_stuck)
    {
        mcqueen.position.x = Last2Position.x;
        mcqueen.position.y = Last2Position.y;
        mcqueen.position.z = Last2Position.z;
        firstCamera.position.x = mcqueen.position.x;
        firstCamera.position.y = mcqueen.position.y;
        // camera.rotation.x = Last2Direction.x;
        // camera.rotation.y = Last2Direction.y;
        // camera.rotation.z = Last2Direction.z;
        camera.lookAt(mcqueen.position)
        camera.up.set(0, 0, 1);
        camera.position.x = mcqueen.position.x - cameraDirection.x*20;
        camera.position.y = mcqueen.position.y - cameraDirection.y*20;
        topCamera.position.x = mcqueen.position.x + cameraDirection.x*20;
        topCamera.position.y = mcqueen.position.y + cameraDirection.y*20;
    }
    Last2Position.x = LastPosition.x;
    Last2Position.y = LastPosition.y;
    Last2Position.z = LastPosition.z;
    LastPosition.x = mcqueen.position.x;
    LastPosition.y = mcqueen.position.y;
    LastPosition.z = mcqueen.position.z;
    
    for(let i=0;i<5 && !game_stuck;i++)
    {
        let theta = i*Math.PI*2/5;
        let calc_dis_fuel = Math.sqrt(Math.pow(mcqueen.position.x - Math.cos(theta)*distance_fuel[i], 2) + Math.pow(mcqueen.position.y - Math.sin(theta)*distance_fuel[i], 2));
        if(i == active_fuel_tank)
            distance_next_value = calc_dis_fuel;
        if(calc_dis_fuel < 22 && fuel_picked[i] == 0)
        {
            console.log(fuel_value);
            fuel_picked[i] = 1;
            fuel_value += 23;
            scene.remove(fuel_mesh[i]);
            if(fuel_value > 100)
            {
                fuel_value = 100;
            }
            break;
        }
        let theta_car = Math.atan(mcqueen.position.y/mcqueen.position.x);
        if(mcqueen.position.x < 0)
        {
            theta_car += Math.PI;
        }
        else if(mcqueen.position.y < 0)
        {
            theta_car += 2*Math.PI;
        }
        if(theta_car < theta + Math.PI/90 && theta_car > theta - Math.PI/90 && fuel_active[i] == 1)
        {
            fuel_active[i] = 0;
            fuel_active[(i+1)%5] = 1;
            active_fuel_tank = (i+1) % 5;
            scene.add(fuel_mesh[(i+1)%5]);
            let j = 4;
            if(i != 0 )
                j = i-1;
            fuel_picked[j] = 0;
            if(fuel_mesh[j].parent === scene)
            {
                scene.remove(fuel_mesh[(i-1)%5]);
            }
            if(j == 0)
            {
                console.log("Checkpoint number : " + j);
                check_point[j] = 1;
            }
            else if(check_point[j-1] == 1)
            {
                console.log("Checkpoint number : " + j);
                check_point[j] = 1;
            }
        }

        if(theta_car < theta + Math.PI/60 && theta_car > theta && check_point[4] == 1)
        {
            console.log(current_lap);
            lap[current_lap++] = 1;
            check_point = [0, 0, 0, 0, 0];
            if(current_lap == 3)
            {   
                let finish_time = (Date.now() - start)/1000;
                console.log(finish_time)
                end_game = 1;
                let rank = 1;
                for(let k = 0;k<3;k++)
                {   
                    console.log(opp_car_stop[k])
                    if(opp_car_stop[k] != 0)
                    {
                        if(opp_car_stop[k] < finish_time)
                            rank++;
                    }
                }
                renderer.setClearColor("#000000")
                renderer.clear()
                console.log("rank : " + rank);
                document.getElementById("rank").innerHTML = "GAME OVER!!! <br> Your rank is : " + rank + "<br>" + document.getElementById("score").innerHTML;
                return;
            }
        }
    }
    if(!game_stuck)
    {
        let mileage_value = 0
        if(total_fuel_consumed == 0)
            mileage_value = 0;
        else
            mileage_value = (total_distance_covered/total_fuel_consumed).toFixed(2);
        let time_elapsed = Date.now() - start;
        var score = health_bar_value*4;
        score = Number(score)
        score += Number((current_lap*3000*1000/time_elapsed));
        score += Number(mileage_value*10);
        health_bar.innerHTML = "HEALTH : " + health_bar_value;
        fuel_tank.innerHTML = "FUEL : " + fuel_value.toFixed(1);
        time_board.innerHTML = "TIME : " + (time_elapsed/1000).toFixed(0) + "." + (time_elapsed%1000);
        score_board.innerHTML = "SCORE : " + score.toFixed(2);
        distance_next.innerHTML = "NEXT FUEL TANK IN : " + distance_next_value.toFixed(2) +"m";
        mileage_bar.innerHTML = "MILEAGE : " + mileage_value;
    }
    if(!game_stuck)
        render()
}

function render() {
    renderer.clear();
    renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
    if(whichCamera == 0)
        renderer.render( scene, camera );
    else
        renderer.render(scene, firstCamera);
    renderer.clearDepth();
    renderer.setViewport( window.innerWidth - insetWidth - 10, window.innerHeight - insetHeight - 10, insetWidth, insetHeight );
    renderer.render( scene, topCamera );
}

animate()