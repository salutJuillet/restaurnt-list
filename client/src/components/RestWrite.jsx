import React, { useState } from 'react'
import { Modal, ModalHeader, ModalBody, Container, Button, Form, FormGroup, Label, Input, Col } from 'reactstrap'
import DaumPostCodeEmbed from 'react-daum-postcode';
import axios from 'axios';

const RestWrite = () => {
  //state 셋팅
  const [rWrite, setRWrite] = useState({
    title:'',
    titleFood:'',
    tel1:'',
    tel2:'',
    tel3:'',
    zipCode:'',
    address1:'',
    address2:'',
    radius:'',
    file:null, //바이너리 코드로 받아진다.
    fileName:''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [sigun, setSigun] = useState('');
  const [oldAddress, setOldAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  

  //다음 api
  const handleComplete = (data) => {
    let fullAddress = data.address;
    let jibunAddress =  data.jibunAddress;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
      jibunAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }
    console.log(fullAddress); // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'

    //위도 경도 찾기
    //1. 주소-좌표 변환객체 생성
    let geocoder = new window.kakao.maps.services.Geocoder();
    //2. 주소로 좌표 검색
    geocoder.addressSearch(fullAddress, (result, status)=>{
       //성공
       if(status === window.kakao.maps.services.Status.OK) {
           let coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
           setLatitude(coords.Ma);
           setLongitude(coords.La);
       }else{
            setLatitude('33.450701');
            setLongitude('126.570667');
       }
    });


    const mysigun = fullAddress.split(' ');
    if(
        mysigun[0] === '서울' ||
        mysigun[0] === '부산' ||
        mysigun[0] === '대구' ||
        mysigun[0] === '인천' ||
        mysigun[0] === '광주' ||
        mysigun[0] === '대전' ||
        mysigun[0] === '울산' ||
        mysigun[0] === '세종특별자치시'
    ){
        setSigun(mysigun[0]);
    }else{
        setSigun(mysigun[1]);
    }

    let newRWrite = {...rWrite};
    //rWrite를 복제해서 state를 바꿔준다. 안그러면 변경사항 외의 값들이 날라갈 수 있기때문
    newRWrite['zipCode'] = data.zonecode;
    newRWrite['address1'] = fullAddress;
    setRWrite(newRWrite);
    setOldAddress(jibunAddress);
    
    setIsOpen(false);
  };


  //주소 검색창
  const handleClick = () => {
    setIsOpen(true);
  }

  const handleClose = () => {
    setIsOpen(false);
  }

  const handleInput = (e) => {
    let newRWrite = {...rWrite}; //바로 수정이 불가능하니까 rWrite를 복제해둠
    newRWrite[e.target.name] = e.target.value;
    setRWrite(newRWrite);
    // console.log(rWrite.title, rWrite.titleFood);
  }

  const handleFile = (e) => {
    const file = e.target.files[0];
    const fileName = e.target.value;
    // console.dir(file);
    // console.log(fileName);

    let newRWrite = {...rWrite};
    newRWrite['file'] = file;
    newRWrite['fileName'] = fileName;
    setRWrite(newRWrite);
  }

//   const addUser = (e) => {
//     e.preventDefault();

//     const url = '/api/write';
//     const formData = new FormData(); //폼을 직접 만들어서 append로 db 순서에 맞게 내용을 넣어준다.
//     formData.append('sigun', sigun);
//     formData.append('title', rWrite.title);
//     formData.append('title_food', rWrite.titleFood);
//     formData.append('tel', rWrite.tel1 + "-" + rWrite.tel2 + "-" + rWrite.tel3);
//     formData.append('zip', rWrite.zipCode);
//     formData.append('address', rWrite.address1+" " + rWrite.address2);
//     formData.append('oldAddress', oldAddress + " "+ rWrite.address2);
//     formData.append('latitude', latitude);
//     formData.append('longitude', longitude);
//     formData.append('radius', rWrite.radius);
//     formData.append('files', rWrite.fileName);
//     const config = {
//         headers:{
//             'content-type': 'multipart/form-data'
//         }
//     }
//     return formData.post(url, config);
    
//     // for(let value of formData.values()){
//     //     console.log(value);
//     // }
//   }

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = "/api/write" //지금이 /write니까 루트폴더부터 api/write로 가도록
    const tel = rWrite.tel1 + '-' + rWrite.tel1 + '-' + rWrite.tel3;
    const address = rWrite.address1 + ' || ' + rWrite.address2;
    const address_old = oldAddress + ' || ' + rWrite.address2;
    const formData = new FormData();
    formData.append('sigun', sigun);
    formData.append('title', rWrite.title);
    formData.append('tel', tel);
    formData.append('title_food', rWrite.titleFood);
    formData.append('zip', rWrite.zipCode);
    formData.append('address', address);
    formData.append('adderss_old', address_old);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('radius', rWrite.radius);
    formData.append('files', rWrite.file);
    axios.post(url, formData, { //url에 formData를 업로드함
        headers:{
            'Content-Type':'multipart/form-data' //이미지파일 때문에
        }
    })
    .then((response)=>{
        console.log(response.data);
    })
    .catch((error)=>{
        console.log(error);
    })
  }


  return (
    <Container className="writeBox">
        <h2 className="text-center my-5">새로운 식당 등록</h2>
        <Form onSubmit={handleSubmit}>
            {/* <Input type="hidden" name="sigun" value={sigun} />
            <Input type="hidden" name="oldAddress" value={oldAddress} />
            <Input type="hidden" name="latitude" value={latitude}  />
            <Input type="hidden" name="longitude" value={longitude} /> */}

            <FormGroup row>
                <Label for="title" sm={3}>
                    식당 이름
                </Label>
                <Col sm={9}>
                    <Input id="title" 
                           name="title" 
                           placeholder="식당이름" 
                           type="text" 
                           onChange={handleInput}
                           value={rWrite.title} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label for="title_food" sm={3}>
                    주요메뉴
                </Label>
                <Col sm={9}>
                    <Input id="title_food" 
                           name="titleFood" 
                           placeholder="주요메뉴" 
                           type="text" 
                           onChange={handleInput}
                           value={rWrite.titleFood} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label for="tel1" sm={3}>
                    전화번호
                </Label>
                <Col sm={3}>
                    <Input id="tel1" 
                           name="tel1" 
                           placeholder="전화번호" 
                           type="number" 
                           onChange={handleInput}
                           value={rWrite.tel1} />
                </Col>
                <Col sm={3}>
                    <Input id="tel2" 
                           name="tel2" 
                           type="number" 
                           onChange={handleInput}
                           value={rWrite.tel2} />
                </Col>
                <Col sm={3}>
                    <Input id="tel3" 
                           name="tel3" 
                           type="number" 
                           onChange={handleInput}
                           value={rWrite.tel3} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label for="zip" sm={3}>
                    우편번호
                </Label>
                <Col sm={3}>
                    <Input name="zipCode" type="text" readOnly value={rWrite.zipCode||''} />
                </Col>
                <Col sm={2}>
                    <Button outline onClick={handleClick}>주소 검색</Button>
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label sm={3}>
                    주소
                </Label>
                <Col sm={9}>
                    <Input type="text" name="address1" readOnly value={rWrite.address1||''} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Col sm={3}></Col>
                <Col sm={9}>
                    <Input type="text" 
                           name="address2" 
                           placeholder="상세주소" 
                           onChange={handleInput}
                           value={rWrite.address2} />
                     
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label sm={3}>거리뷰</Label>
                <Col sm={3}>
                <Input type="number" 
                       name="radius" 
                       placeholder="거리뷰"
                       onChange={handleInput}
                       value={rWrite.radius} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label sm={3}>이미지 업로드</Label>
                <Col sm={9}>
                    <Input type="file" 
                           name="file" 
                           placeholder="이미지 업로드"
                           onChange={handleFile}
                           value={rWrite.fileName} />
                </Col>
            </FormGroup>

            <FormGroup row className="my-5">
                <Col sm={3}></Col>
                <Col sm={3}>
                    <Button color="danger" block outline>취소</Button>
                </Col>
                <Col sm={3}>
                    <Button type="submit" color="primary" block outline>전송</Button>
                </Col>
                <Col sm={3}></Col>
            </FormGroup>
        </Form>

        <Modal isOpen={isOpen} toggle={function noRefCheck(){}}>
            <ModalHeader toggle={function noRefCheck(){}} onClick={handleClose}>
                
            </ModalHeader>

            <ModalBody>
                <DaumPostCodeEmbed onComplete={handleComplete} />
            </ModalBody>
        </Modal>
    </Container>
    
  )
}

export default RestWrite