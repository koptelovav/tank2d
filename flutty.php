<?php


/*AuthFromSystem();

$countFiles = 0;
$offset = 0;

while(true){
    $data = downloadFile('https://dev.flurry.com/eventsLogCsv.do?projectID=197320&versionCut=versionsAll&intervalCut=customInterval2012_05_16-2013_05_01&stream=true&direction=1&offset='.$offset);
    if (strlen($data) > 90) {
        if(preg_match('/App Advertising and Analytics/',$data) || preg_match('/Service Temporarily Unavailable/',$data)){
            sleep(15);
        }else{
            $countFiles++;
            $offset += 20;
            file_put_contents('./data/'.$countFiles.'.csv', $data);
            sleep(rand( 2, 5));
        }
    }else{

        break;
    }
}*/
merge_file('BEGIN-2013_05_01.csv', 265);

function downloadFile($url)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url); // отправляем на
    curl_setopt($ch, CURLOPT_HEADER, 0); // пустые заголовки
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // возвратить то что вернул сервер
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // следовать за редиректами
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30); // таймаут4
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // просто отключаем проверку сертификата
    curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__) . '/cookie.txt'); // сохранять куки в файл
    curl_setopt($ch, CURLOPT_COOKIEFILE, dirname(__FILE__) . '/cookie.txt');
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.2) Gecko/20090729 Firefox/3.5.2 GTB5');
    $data = curl_exec($ch);
    curl_close($ch);

    return $data;
}

function AuthFromSystem()
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://dev.flurry.com/secure/loginAction.do'); // отправляем на
    curl_setopt($ch, CURLOPT_HEADER, 0); // пустые заголовки
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // возвратить то что вернул сервер
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // следовать за редиректами
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30); // таймаут4
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // просто отключаем проверку сертификата
    curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__) . '/cookie.txt'); // сохранять куки в файл
    curl_setopt($ch, CURLOPT_COOKIEFILE, dirname(__FILE__) . '/cookie.txt');
    curl_setopt($ch, CURLOPT_POST, 1); // использовать данные в post
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.2) Gecko/20090729 Firefox/3.5.2 GTB5');
    curl_setopt($ch, CURLOPT_POSTFIELDS, array(
        'loginEmail' => 'alexey.koptelov@nevosoft.ru',
        'loginPassword' => 'prF#2@y9',
    ));
    curl_exec($ch);
    curl_close($ch);
}


function merge_file($merged_file_name,$parts_num)

{

    $content='';

//put splited files content into content

    for($i=0;$i<$parts_num;$i++)

    {
        $fileName = './data/'.($i+1).'.csv';
        $file_size = filesize($fileName);
        $handle = fopen($fileName, 'rb') or die("error opening file");
        $content .= fread($handle, $file_size) or die("error reading file");
        fclose($handle);
    }

    $handle=fopen($merged_file_name, 'wb') or die("error creating/opening merged file");
    fwrite($handle, $content) or die("error writing to merged file");
    fclose($handle);
    echo 'OK';

}