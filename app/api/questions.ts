import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { title, description, testCases } = req.body;

        console.log('받은 데이터:', { title, description, testCases });

        // 여기에 데이터베이스 저장 로직 추가 가능
        return res.status(200).json({ message: '문제가 성공적으로 등록되었습니다!' });
    } else {
        return res.status(405).json({ message: '지원하지 않는 메서드입니다.' });
    }
}
