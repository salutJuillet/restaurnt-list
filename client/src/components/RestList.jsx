import React, {useState, useEffect} from 'react'
import { Container, ListGroup } from 'reactstrap'
import { Outlet, Link } from 'react-router-dom';
import RestListItem from './RestListItem'
import axios from 'axios' //외부 json 파일 가져오기

const RestList = () => {
    const [rest, setRest] = useState([]);

    useEffect(() => {
        axios.get('./api')
        .then(rs => setRest(...rest, rs.data))
        // .then(rs => console.log(rs.data));
        //...의미는 배열 하나하나 집어넣으라
        //axios로 가져온건 무조건 data로 결과값이 나온다.
    }, []);

  return (
    <Container>
        <h1 className="text-center my-5"> 경기도 맛집 리스트 </h1>
        <div className="text-right mb-2">
            <Link to="/write" className="write">글쓰기</Link>
            <Outlet />
        </div>
        <ListGroup>
            {
                rest.map( c => (
                    <RestListItem
                        key={c.id}
                        id={c.id}
                        sigun={c.sigun}
                        title={c.title}
                        tel={c.tel}
                        title_food={c.title_food}
                        zip={c.zip}
                        address={c.address}
                        address_old={c.address_old}
                        latitude={c.latitude}
                        longitude={c.longitude}
                        radius={c.radius}
                    />
                ))
            }
            
        </ListGroup>
    </Container>
  )
}

export default RestList