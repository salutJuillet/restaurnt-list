import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, Container, Button, Form, FormGroup, Label, Input, Col } from 'reactstrap'
import DaumPostCodeEmbed from 'react-daum-postcode';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RestEdit = () => {
  //state 셋팅
  const [rEdit, setREdit] = useState({
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

  //match.params.id는 match가 더이상 사용되지 않는다. react-router-dom의 useParams를 이용한다.
  const { id } = useParams();


  //데이터를 가져와서 연결하기
  useEffect(() => {
    axios.get('/api/edit/' + id)
    .then(rs => {
        let newREdit = {...rEdit};
        const row = rs.data[0];
        const [tel1, tel2, tel3] = row.tel.split('-');
        // const [address1, address2] = row.address.split('||'); //어차피 상세주소 없음
        newREdit['title'] = row.title;
        newREdit['titleFood'] = row.title_food;
        newREdit['tel1'] = tel1;
        newREdit['tel2'] = tel2;
        newREdit['tel3'] = tel3;
        newREdit['zipCode'] = row.zip;
        newREdit['address1'] = row.address;
        newREdit['radius'] = row.radius;
        setOldAddress(row.address_old);
        setLatitude(row.latitude);
        setLongitude(row.longitude);
        setREdit(newREdit);
    })
  });

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
            console.log('좌표값 불러오기 실패');
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

    let newREdit = {...rEdit};
    //rEdit를 복제해서 state를 바꿔준다. 안그러면 변경사항 외의 값들이 날라갈 수 있기때문
    newREdit['zipCode'] = data.zonecode;
    newREdit['address1'] = fullAddress;
    setREdit(newREdit);
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
    let newREdit = {...rEdit}; //바로 수정이 불가능하니까 rEdit를 복제해둠
    newREdit[e.target.name] = e.target.value;
    setREdit(newREdit);
    // console.log(rEdit.title, rEdit.titleFood);
  }

  const handleFile = (e) => {
    const file = e.target.files[0];
    const fileName = e.target.value;
    console.dir(file);
    console.log(fileName);

    let newREdit = {...rEdit};
    newREdit['file'] = file;
    newREdit['fileName'] = fileName;
    setREdit(newREdit);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = "/api/edit" //지금이 /edit니까 루트폴더부터 api/edit로 가도록
    const tel = rEdit.tel1 + '-' + rEdit.tel1 + '-' + rEdit.tel3;
    const address = rEdit.address1 + ' || ' + rEdit.address2;
    const address_old = oldAddress + ' || ' + rEdit.address2;
    const formData = new FormData();
    formData.append('sigun', sigun);
    formData.append('title', rEdit.title);
    formData.append('tel', tel);
    formData.append('title_food', rEdit.titleFood);
    formData.append('zip', rEdit.zipCode);
    formData.append('address', address);
    formData.append('adderss_old', address_old);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('radius', rEdit.radius);
    formData.append('files', rEdit.file);
    axios.post(url, formData, { //url에 formData를 업로드함
        headers:{
            'Content-Type':'multipart/form-data' //이미지파일 때문에
        }
    }).then((res)=>{
        console.log(res.data);
    })

  }


  return (
    <Container className="writeBox">
        <h2 className="text-center my-5">{id}번 새로운 식당 등록</h2>
        <Form onSubmit={e => handleSubmit(e)}>
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
                           value={rEdit.title} />
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
                           value={rEdit.titleFood} />
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
                           value={rEdit.tel1} />
                </Col>
                <Col sm={3}>
                    <Input id="tel2" 
                           name="tel2" 
                           type="number" 
                           onChange={handleInput}
                           value={rEdit.tel2} />
                </Col>
                <Col sm={3}>
                    <Input id="tel3" 
                           name="tel3" 
                           type="number" 
                           onChange={handleInput}
                           value={rEdit.tel3} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label for="zip" sm={3}>
                    우편번호
                </Label>
                <Col sm={3}>
                    <Input name="zipCode" type="text" readOnly value={rEdit.zipCode||''} />
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
                    <Input type="text" name="address1" readOnly value={rEdit.address1||''} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Col sm={3}></Col>
                <Col sm={9}>
                    <Input type="text" 
                           name="address2" 
                           placeholder="상세주소" 
                           onChange={handleInput}
                           value={rEdit.address2} />
                     
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label sm={3}>거리뷰</Label>
                <Col sm={3}>
                <Input type="number" 
                       name="radius" 
                       placeholder="거리뷰"
                       onChange={handleInput}
                       value={rEdit.radius} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label sm={3}>이미지 업로드</Label>
                <Col sm={9}>
                    <Input type="file" 
                           name="file" 
                           placeholder="이미지 업로드"
                           onChange={handleFile}
                           value={rEdit.fileName} />
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

export default RestEdit