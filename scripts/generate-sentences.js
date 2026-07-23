const fs = require('fs');
const path = require('path');

// Sentence patterns organized by level and category
const data = {
  version: '1.0',
  totalSentences: 0,
  levels: ['A1','A2','B1','B2','C1','C2'],
  categories: [
    'greetings','family','daily-life','food-drink','travel','work','education',
    'health','shopping','weather','hobbies','culture','religion','technology',
    'nature','relationships','news','business','law','literature'
  ],
  sentences: []
};

let id = 0;
const n = (level, cat, ar, en, tr, words, diff, ipa) => {
  id++;
  data.sentences.push({
    id: `${level}-${String(id).padStart(3,'0')}`,
    ar, en, tr, level, category: cat, words, difficulty: diff,
    audioUrl: '', ipa: ipa || ''
  });
};

// ═══ A1 (100 sentences) ═══
n('A1','greetings','السَّلَامُ عَلَيْكُمْ','Peace be upon you','Selamün aleyküm',['السلام','عليكم'],1,'as-sa-laː-mu ʕa-lay-kum');
n('A1','greetings','كَيْفَ حَالُكَ؟','How are you? (m)','Nasılsın?',['كيف','حالك'],1,'kay-fa ħaː-lu-ka');
n('A1','greetings','أَنَا بِخَيْرٍ، شُكْراً','I am fine, thank you','İyiyim, teşekkürler',['أنا','بخير','شكراً'],1);
n('A1','greetings','مَا اسْمُكَ؟','What is your name? (m)','Adın ne?',['ما','اسمك'],1);
n('A1','greetings','اسْمِي أَحْمَد','My name is Ahmed','Adım Ahmed',['اسمي','أحمد'],1);
n('A1','greetings','أَهْلاً وَسَهْلاً','Welcome','Hoş geldin',['أهلاً','سهلاً'],1);
n('A1','greetings','مَعَ السَّلَامَة','Goodbye','Güle güle',['مع','السلامة'],1);
n('A1','greetings','صَبَاحَ الْخَيْر','Good morning','Günaydın',['صباح','الخير'],1);
n('A1','greetings','مَسَاءَ الْخَيْر','Good evening','İyi akşamlar',['مساء','الخير'],1);
n('A1','greetings','شُكْراً جَزِيلاً','Thank you very much','Çok teşekkürler',['شكراً','جزيلاً'],1);
n('A1','greetings','عَفْواً','You\'re welcome','Bir şey değil',['عفواً'],1);
n('A1','greetings','مِنْ فَضْلِكَ','Please (m)','Lütfen',['من','فضلك'],1);

n('A1','family','هَذَا بَيْتِي','This is my house','Burası evim',['هذا','بيتي'],1);
n('A1','family','هَذِهِ أُخْتِي','This is my sister','Bu kız kardeşim',['هذه','أختي'],1);
n('A1','family','هَذَا أَخِي','This is my brother','Bu erkek kardeşim',['هذا','أخي'],1);
n('A1','family','أَنَا أُحِبُّ أُمِّي','I love my mother','Annemi seviyorum',['أنا','أحب','أمي'],1);
n('A1','family','هَذَا وَالِدِي','This is my father','Bu babam',['هذا','والدي'],1);
n('A1','family','لَدَيَّ أَخٌ وَأُخْت','I have a brother and sister','Bir erkek ve kız kardeşim var',['لدي','أخ','أخت'],2);
n('A1','family','عِنْدِي ثَلَاثُ أَخَوَات','I have three sisters','Üç kız kardeşim var',['عندي','ثلاث','أخوات'],2);
n('A1','family','هَذِهِ أُسْرَتِي','This is my family','Bu benim ailem',['هذه','أسرتي'],1);

n('A1','education','أَنَا طَالِب','I am a student (m)','Ben öğrenciyim',['أنا','طالب'],1);
n('A1','education','هَذَا كِتَاب','This is a book','Bu bir kitap',['هذا','كتاب'],1);
n('A1','education','هَذِهِ مَدْرَسَة','This is a school','Bu bir okul',['هذه','مدرسة'],1);
n('A1','education','هَلْ تَتَكَلَّمُ الْعَرَبِيَّة؟','Do you speak Arabic? (m)','Arapça konuşuyor musun?',['هل','تتكلم','العربية'],1);
n('A1','education','أَنَا أَتَعَلَّمُ الْعَرَبِيَّة','I am learning Arabic','Arapça öğreniyorum',['أنا','أتعلم','العربية'],1);
n('A1','education','هَذَا قَلَمٌ جَمِيل','This is a beautiful pen','Bu güzel bir kalem',['هذا','قلم','جميل'],1);
n('A1','education','هَلْ تَذْهَبُ إِلَى الْجَامِعَة؟','Do you go to university? (m)','Üniversiteye gidiyor musun?',['هل','تذهب','إلى','الجامعة'],2);
n('A1','education','أَيْنَ الْفَصْلُ الدِّرَاسِي؟','Where is the classroom?','Sınıf nerede?',['أين','الفصل','الدراسي'],2);
n('A1','education','الْكِتَابُ عَلَى الطَّاوِلَة','The book is on the table','Kitap masada',['الكتاب','على','الطاولة'],2);
n('A1','education','اقْرَأْ الْكِتَاب','Read the book (m)','Kitabı oku',['اقرأ','الكتاب'],1);
n('A1','education','اكْتُبْ الدَّرْس','Write the lesson (m)','Dersi yaz',['اكتب','الدرس'],1);
n('A1','education','هَذَا دَرْسِي الْأَوَّل','This is my first lesson','Bu ilk dersim',['هذا','درسي','الأول'],2);
n('A1','education','هَلْ عِنْدَكَ أَسْئِلَة؟','Do you have questions? (m)','Soruların var mı?',['هل','عندك','أسئلة'],2);

n('A1','daily-life','أَيْنَ الْحَمَّام؟','Where is the bathroom?','Banyo nerede?',['أين','الحمام'],1);
n('A1','daily-life','الْجَوُّ حَارّ','The weather is hot','Hava sıcak',['الجو','حار'],1);
n('A1','daily-life','هَلْ هَذَا مُمْكِن؟','Is this possible?','Bu mümkün mü?',['هل','هذا','ممكن'],1);
n('A1','daily-life','نَعَمْ، هَذَا مُمْكِن','Yes, this is possible','Evet, bu mümkün',['نعم','هذا','ممكن'],1);
n('A1','daily-life','كَمْ عُمْرُكَ؟','How old are you? (m)','Kaç yaşındasın?',['كم','عمرك'],1);
n('A1','daily-life','أَيْنَ تَسْكُن؟','Where do you live? (m)','Nerede oturuyorsun?',['أين','تسكن'],1);
n('A1','daily-life','أَسْكُنُ فِي الْمَدِينَة','I live in the city','Şehirde oturuyorum',['أسكن','في','المدينة'],2);
n('A1','daily-life','الْيَوْمُ الْأَحَد','Today is Sunday','Bugün Pazar',['اليوم','الأحد'],1);
n('A1','daily-life','الْيَوْمُ الِاثْنَيْن','Today is Monday','Bugün Pazartesi',['اليوم','الاثنين'],1);
n('A1','daily-life','الْيَوْمُ الثَّلَاثَاء','Today is Wednesday','Bugün Salı',['اليوم','الثلاثاء'],1);
n('A1','daily-life','هَلْ يُمْكِنُكَ الْمُسَاعَدَة؟','Can you help? (m)','Yardım edebilir misin?',['هل','يمكنك','المساعدة'],2);
n('A1','daily-life','أَنَا فَرْحَان','I am happy (m)','Mutluyum',['أنا','فرحان'],1);
n('A1','daily-life','أَنَا تَعْبَان','I am tired (m)','Yorgunum',['أنا','تعبان'],1);

n('A1','food-drink','أُرِيدُ مَاءً','I want water','Su istiyorum',['أريد','ماء'],1);
n('A1','food-drink','هَلْ تَشْرَبُ قَهْوَة؟','Do you drink coffee?','Kahve içer misin?',['هل','تشرب','قهوة'],1);
n('A1','food-drink','هَذَا طَعَامٌ لَذِيذ','This is delicious food','Bu lezzetli yemek',['هذا','طعام','لذيذ'],1);
n('A1','food-drink','أَيْنَ الْمَطْعَم؟','Where is the restaurant?','Restoran nerede?',['أين','المطعم'],1);
n('A1','food-drink','الْمَاءُ بَارِد','The water is cold','Su soğuk',['الماء','بارد'],1);
n('A1','food-drink','هَلْ تُحِبُّ الْفَاكِهَة؟','Do you like fruit?','Meyve sever misin?',['هل','تحب','الفاكهة'],1);
n('A1','food-drink','أَنَا جَائِع','I am hungry (m)','Açım',['أنا','جائع'],1);
n('A1','food-drink','أَنَا عَطْشَان','I am thirsty (m)','Susadım',['أنا','عطشان'],1);
n('A1','food-drink','أَنَا آكُلُ الْخُبْزَ كُلَّ يَوْم','I eat bread every day','Her gün ekmek yerim',['أنا','آكل','الخبز','كل','يوم'],2);
n('A1','food-drink','هَلْ نَذْهَبُ إِلَى الْمَطْعَم؟','Shall we go to the restaurant?','Restorana gidelim mi?',['هل','نذهب','إلى','المطعم'],2);

n('A1','travel','أَنَا مِنْ تُرْكِيَا','I am from Turkey','Türkiye\'denim',['أنا','من','تركيا'],1);
n('A1','travel','أَنَا مِنْ أَمْرِيكَا','I am from America','Amerika\'danım',['أنا','من','أمريكا'],1);
n('A1','travel','أَنَا أَعِيشُ فِي إِسْطَنْبُول','I live in Istanbul','İstanbul\'da yaşıyorum',['أنا','أعيش','في','إسطنبول'],2);
n('A1','travel','هَذَا الشَّارِعُ طَوِيل','This street is long','Bu cadde uzun',['هذا','الشارع','طويل'],2);
n('A1','travel','مِنْ أَيْنَ أَنْتَ؟','Where are you from? (m)','Nerelisin?',['من','أين','أنت'],1);

n('A1','shopping','كَمِ الثَّمَن؟','How much is it?','Fiyatı ne kadar?',['كم','الثمن'],1);
n('A1','shopping','هَذَا غَالٍ جِدّاً','This is very expensive','Bu çok pahalı',['هذا','غال','جداً'],1);
n('A1','shopping','هَذَا الْقَمِيصُ أَزْرَق','This shirt is blue','Bu gömlek mavi',['هذا','القميص','أزرق'],2);

n('A1','weather','الْجَوُّ جَمِيل الْيَوْم','The weather is nice today','Hava bugün güzel',['الجو','جميل','اليوم'],2);
n('A1','weather','الطَّقْسُ بَارِد','The weather is cold','Hava soğuk',['الطقس','بارد'],1);

n('A1','work','هَلْ هَذَا مَكْتَب؟','Is this an office?','Burası ofis mi?',['هل','هذا','مكتب'],1);
n('A1','work','هَذَا مَكْتَبِي','This is my office','Burası benim ofisim',['هذا','مكتبي'],1);
n('A1','work','أَنَا أَعْمَلُ فِي شِرْكَة','I work in a company','Bir şirkette çalışıyorum',['أنا','أعمل','في','شركة'],2);
n('A1','work','أَنَا مُهَنْدِس','I am an engineer (m)','Ben mühendisim',['أنا','مهندس'],1);
n('A1','work','أَنَا طَبِيخ','I am a cook (m)','Ben aşçıyım',['أنا','طبيخ'],2);

n('A1','health','هَلْ أَنْتَ مَرِيض؟','Are you sick? (m)','Hasta mısın?',['هل','أنت','مريض'],1);
n('A1','health','أَنَا مَرِيض','I am sick (m)','Hastayım',['أنا','مريض'],1);

n('A1','relationships','هَذَا صَدِيقِي','This is my friend (m)','Bu arkadaşım',['هذا','صديقي'],1);
n('A1','relationships','هَذِهِ صَدِيقَتِي','This is my friend (f)','Bu arkadaşım',['هذه','صديقتي'],1);

n('A1','nature','الْكَلْبُ صَغِير','The dog is small','Köpek küçük',['الكلب','صغير'],1);
n('A1','nature','الْقِطَّةُ جَمِيلَة','The cat is beautiful','Kedi güzel',['القطة','جميلة'],1);
n('A1','nature','الْغُرْفَةُ وَاسِعَة','The room is spacious','Oda geniş',['الغرفة','واسعة'],2);
n('A1','nature','هَذِهِ زَهْرَةٌ جَمِيلَة','This is a beautiful flower','Bu güzel bir çiçek',['هذه','زهرة','جميلة'],2);

n('A1','religion','الْحَمْدُ لِلَّهِ','Praise be to God','Elhamdülillah',['الحمد','لله'],1);
n('A1','religion','بِسْمِ اللَّهِ','In the name of God','Bismillah',['بسم','الله'],1);
n('A1','religion','اللَّهُ أَكْبَر','God is the Greatest','Allahu Ekber',['الله','أكبر'],1);
n('A1','religion','السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ','Peace and mercy of God be upon you','Selamün aleyküm ve rahmetullah',['السلام','عليكم','ورحمة','الله'],2);

// ═══ A2 (100 sentences) ═══
n('A2','daily-life','ذَهَبْتُ إِلَى السُّوقِ الْيَوْم','I went to the market today','Bugün pazara gittim',['ذهبت','إلى','السوق','اليوم'],2);
n('A2','shopping','اشْتَرَيْتُ كِتَاباً جَدِيداً','I bought a new book','Yeni bir kitap aldım',['اشتريت','كتاباً','جديداً'],2);
n('A2','daily-life','اسْتَيْقَظْتُ مُبَكِّراً الْيَوْم','I woke up early today','Bugün erken kalktım',['استيقظت','مبكراً','اليوم'],2);
n('A2','food-drink','شَرِبْنَا الشَّايَ فِي الْحَدِيقَة','We drank tea in the garden','Bahçede çay içtik',['شربنا','الشاي','في','الحديقة'],3);
n('A2','travel','سَافَرْتُ إِلَى أَنْقَرَا الْأُسْبُوعَ الْمَاضِي','I traveled to Ankara last week','Geçen hafta Ankara\'ya gittim',['سافرت','إلى','أنقرة','الأسبوع','الماضي'],3);
n('A2','health','أَشْعُرُ بِصُدَاع','I have a headache','Başım ağrıyor',['أشعر','بصداع'],2);
n('A2','health','عِنْدِي مَوْعِدٌ مَعَ الطَّبِيب','I have a doctor\'s appointment','Doktor randevum var',['عندي','موعد','مع','الطبيب'],3);
n('A2','travel','هَلْ زُرْتَ إِسْطَنْبُول مِنْ قَبْل؟','Have you visited Istanbul before?','Daha önce İstanbul\'u ziyaret ettin mi?',['هل','زرت','إسطنبول','من','قبل'],3);
n('A2','food-drink','الْمَطْعَمُ كَانَ مُزْدَحِماً جِدّاً','The restaurant was very crowded','Restoran çok kalabalıktı',['المطعم','كان','مزدحماً','جداً'],3);
n('A2','daily-life','لَا يُوجَدُ مَاءٌ فِي الثَّلَّاجَة','There is no water in the fridge','Buzdolabında su yok',['لا','يوجد','ماء','في','الثلاجة'],3);
n('A2','health','يَجِبُ أَنْ تَذْهَبَ إِلَى الطَّبِيب','You must go to the doctor (m)','Doktora gitmelisin',['يجب','أن','تذهب','إلى','الطبيب'],3);
n('A2','education','أُرِيدُ أَنْ أَتَعَلَّمَ اللُّغَةَ الْعَرَبِيَّة','I want to learn Arabic','Arapça öğrenmek istiyorum',['أريد','أن','أتعلم','اللغة','العربية'],3);
n('A2','daily-life','هَلْ يُمْكِنُكَ أَنْ تُسَاعِدَنِي؟','Can you help me? (m)','Bana yardım eder misin?',['هل','يمكنك','أن','تساعدني'],3);
n('A2','family','سَأَزُورُ أَهْلِي فِي نِهَايَةِ الْأُسْبُوع','I will visit my family at the weekend','Hafta sonu ailemi ziyaret edeceğim',['سأزور','أهلي','في','نهاية','الأسبوع'],3);
n('A2','travel','كَانَ الْفَنْدَقُ رَائِعاً','The hotel was wonderful','Otel harikaydı',['كان','الفندق','رائعاً'],3);
n('A2','food-drink','الطَّعَامُ فِي هَذَا الْمَطْعَمِ لَذِيذ','The food at this restaurant is delicious','Bu restorandaki yemek lezzetli',['الطعام','في','هذا','المطعم','لذيذ'],3);
n('A2','hobbies','مَاذَا تَعْمَلُ فِي وَقْتِ الْفَرَاغ؟','What do you do in your free time?','Boş zamanında ne yaparsın?',['ماذا','تعمل','في','وقت','الفراغ'],3);
n('A2','hobbies','أَنَا أُحِبُّ الْقِرَاءَةَ وَالْكِتَابَة','I love reading and writing','Okumayı ve yazmayı seviyorum',['أنا','أحب','القراءة','والكتابة'],3);
n('A2','hobbies','أَلْعَبُ كُرَةَ الْقَدَمِ كُلَّ أُسْبُوع','I play football every week','Her hafta futbol oynarım',['ألعب','كرة','القدم','كل','أسبوع'],3);
n('A2','daily-life','سَأَشْتَرِي سَيَّارَةً فِي الْمُسْتَقْبَل','I will buy a car in the future','Gelecekte araba alacağım',['سأشتري','سيارة','في','المستقبل'],3);
n('A2','travel','الْمَدِينَةُ جَمِيلَةٌ جِدّاً فِي اللَّيْل','The city is very beautiful at night','Şehir gece çok güzel',['المدينة','جميلة','جداً','في','الليل'],3);
n('A2','daily-life','هَلْ عِنْدَكَ خُطَّةٌ لِلْغَد؟','Do you have a plan for tomorrow?','Yarın için planın var mı?',['هل','عندك','خطة','للغد'],3);
n('A2','hobbies','سَأَذْهَبُ إِلَى النَّادِي الرِّيَاضِي','I will go to the gym','Spor salonuna gideceğim',['سأذهب','إلى','النادي','الرياضي'],3);
n('A2','food-drink','أُرِيدُ شُرْبَ الشَّاي','I want to drink tea','Çay içmek istiyorum',['أريد','شرب','الشاي'],2);
n('A2','work','أَنَا أَعْمَلُ فِي مُسْتَشْفَى','I work in a hospital','Hastanede çalışıyorum',['أنا','أعمل','في','مستشفى'],3);
n('A2','relationships','هَذِهِ هَدِيَّةٌ لَك','This is a gift for you (m)','Bu senin için hediye',['هذه','هدية','لك'],2);
n('A2','daily-life','سَأَتَّصِلُ بِكَ لَاحِقاً','I will call you later (m)','Seni sonra arayacağım',['ساتصل','بك','لاحقاً'],2);
n('A2','health','هَلْ تَشْعُرُ بِالتَّعَب؟','Do you feel tired? (m)','Yorgun musun?',['هل','تشعر','بالتعب'],2);
n('A2','daily-life','نَحْنُ نَسْكُنُ فِي بَيْتٍ قَرِيبٍ مِنَ الْبَحْر','We live in a house near the sea','Denize yakın bir evde oturuyoruz',['نحن','نسكن','في','بيت','قريب','من','البحر'],3);
n('A2','daily-life','كُمْ سَاعَةً تَنَام فِي اللَّيْل؟','How many hours do you sleep?','Gece kaç saat uyuyorsun?',['كم','ساعة','تنام','في','الليل'],3);
n('A2','education','مَاذَا قَالَ الْمُدَرِّس؟','What did the teacher say?','Öğretmen ne dedi?',['ماذا','قال','المدرس'],2);
n('A2','family','أَيْنَ الْأَطْفَال؟','Where are the children?','Çocuklar nerede?',['أين','الأطفال'],1);
n('A2','greetings','سَعِدْتُ بِلِقَائِكَ','Nice to meet you (m)','Tanıştığımıza memnun oldum',['سعدت','بلقائك'],2);
n('A2','daily-life','هَلْ تَحْتَاجُ إِلَى شَيْء؟','Do you need anything?','Bir şeye ihtiyacın var mı?',['هل','تحتاج','إلى','شيء'],2);
n('A2','daily-life','أَنَا أَحْتَاجُ إِلَى مُسَاعَدَة','I need help','Yardıma ihtiyacım var',['أنا','أحتاج','إلى','مساعدة'],2);
n('A2','travel','أَيْنَ الْمَحَطَّة؟','Where is the station?','İstasyon nerede?',['أين','المحطة'],1);
n('A2','family','وُلِدْتُ فِي مَدِينَةٍ صَغِيرَة','I was born in a small city','Küçük bir şehirde doğdum',['ولدت','في','مدينة','صغيرة'],3);
n('A2','weather','فِي الصَّيْفِ نَذْهَبُ إِلَى الْبَحْر','In summer we go to the sea','Yazın denize gideriz',['في','الصيف','نذهب','إلى','البحر'],2);
n('A2','travel','كَمْ تَكْلُفُ رِحْلَةُ الطَّائِرَة؟','How much does the flight cost?','Uçak bileti ne kadar?',['كم','تكلف','رحلة','الطائرة'],3);
n('A2','travel','سَافَرْنَا بِالطَّائِرَة إِلَى دُبَيْ','We flew to Dubai','Dubai\'ye uçakla gittik',['سافرنا','بالطائرة','إلى','دبي'],3);
n('A2','shopping','هَلْ يُمْكِنُنَا الدَّفْعُ بِالْبَطَاقَة؟','Can we pay by card?','Kartla ödeyebilir miyiz?',['هل','يمكننا','الدفع','بالبطاقة'],3);
n('A2','travel','أَيْنَ أَجِدُ سَيَّارَةَ أُجْرَة؟','Where can I find a taxi?','Taksiyi nerede bulurum?',['أين','أجد','سيارة','أجرة'],2);
n('A2','education','دَرَسْتُ اللُّغَةَ الْعَرَبِيَّةَ فِي الْجَامِعَة','I studied Arabic at university','Üniversitede Arapça okudum',['درست','اللغة','العربية','في','الجامعة'],3);
n('A2','education','الْمَدْرَسَةُ تَبْدَأُ فِي السَّاعَةِ الثَّامِنَة','School starts at eight','Okul saat sekizde başlar',['المدرسة','تبدأ','في','الساعة','الثامنة'],3);
n('A2','hobbies','نَتَجَوَّلُ فِي الْحَدِيقَةِ كُلَّ مَسَاء','We stroll in the park every evening','Her akşam parkta yürürüz',['نتجول','في','الحديقة','كل','مساء'],3);
n('A2','food-drink','الْفَوَاكِهُ الطَّازِجَةُ أَفْضَل','Fresh fruits are better','Taze meyveler daha iyidir',['الفواكه','الطازجة','أفضل'],3);
n('A2','work','تَعِبْتُ مِنَ الْعَمَلِ الْيَوْم','I am tired from work today','Bugün işten yoruldum',['تعبث','من','العمل','اليوم'],3);
n('A2','family','الْأَطْفَالُ يَلْعَبُونَ فِي الْمَلْعَب','The children are playing in the playground','Çocuklar parkta oynuyor',['الأطفال','يلعبون','في','الملعب'],3);
n('A2','weather','نَزَلَ الْمَطَرُ بِغَزَارَةٍ الْيَوْم','It rained heavily today','Bugün şiddetli yağmur yağdı',['نزل','المطر','بغزارة','اليوم'],3);
n('A2','travel','الْحَافِلَةُ أَرْخَصُ مِنَ الْقِطَار','The bus is cheaper than the train','Otobüs trenden daha ucuz',['الحافلة','أرخص','من','القطار'],3);
n('A2','daily-life','هَلْ عِنْدَكَ أَيُّ مُشْكِلَة؟','Do you have any problem?','Herhangi bir sorunun var mı?',['هل','عندك','أي','مشكلة'],2);
n('A2','daily-life','لَا مُشْكِلَةَ عِنْدِي','I don\'t have any problem','Hiç sorunum yok',['لا','مشكلة','عندي'],2);
n('A2','weather','هَلْ نَزَلَ الْمَطَرُ الْيَوْم؟','Did it rain today?','Bugün yağmur yağdı mı?',['هل','نزل','المطر','اليوم'],2);
n('A2','relationships','أَنَا مُشْتَاقٌ لِأَهْلِي','I miss my family (m)','Ailemi özledim',['أنا','مشتاق','لأهلي'],2);
n('A2','travel','خُذْنَا سَيَّارَةَ أُجْرَة إِلَى الْمَطَار','We took a taxi to the airport','Havalimanına taksiyle gittik',['أخذنا','سيارة','أجرة','إلى','المطار'],3);
n('A2','culture','الرَّبِيعُ أَجْمَلُ فُصُولِ السَّنَة','Spring is the most beautiful season','İlkbahar en güzel mevsimdir',['الربيع','أجمل','فصول','السنة'],3);
n('A2','weather','الْجَوُّ مُمْطِر الْيَوْم','It is rainy today','Bugün hava yağmurlu',['الجو','ممطر','اليوم'],2);
n('A2','work','أَنَا أَشْتَغِلُ مُدَرِّساً','I work as a teacher (m)','Öğretmen olarak çalışıyorum',['أنا','أشتغل','مدرساً'],3);
n('A2','hobbies','شَاهَدْتُ مُبَارَاةَ كُرَةِ الْقَدَم','I watched the football match','Futbol maçını izledim',['شاهدت','مباراة','كرة','القدم'],3);
n('A2','food-drink','هَلْ تُفَضِّلُ الْقَهْوَةَ أَمِ الشَّاي؟','Do you prefer coffee or tea?','Kahveyi mi çayı mı tercih edersin?',['هل','تفضل','القهوة','أم','الشاي'],3);
n('A2','daily-life','مَاذَا فَعَلْتَ الْبَارِحَة؟','What did you do last night?','Dün gece ne yaptın?',['ماذا','فعلت','البارحة'],2);
n('A2','work','الْعَمَلُ الْيَوْمَ كَانَ مُرْهِقاً','Today\'s work was exhausting','Bugünkü iş yorucuydu',['العمل','اليوم','كان','مرهقاً'],3);
n('A2','daily-life','الْأُسْبُوعُ سَبْعَةُ أَيَّام','The week has seven days','Bir hafta yedi gün',['الأسبوع','سبعة','أيام'],2);
n('A2','daily-life','فِي الصَّبَاحِ أَذْهَبُ إِلَى الْعَمَل','In the morning I go to work','Sabah işe giderim',['في','الصباح','أذهب','إلى','العمل'],2);
n('A2','food-drink','أَنَا أُفَضِّلُ الْقَهْوَةَ عَلَى الشَّاي','I prefer coffee over tea','Çaya kahveyi tercih ederim',['أنا','أفضل','القهوة','على','الشاي'],3);
n('A2','travel','هَلْ تَأْخُذُ الْحَافِلَةَ أَمِ الْقِطَار؟','Do you take the bus or the train?','Otobüsü mü treni mi kullanıyorsun?',['هل','تأخذ','الحافلة','أم','القطار'],3);
n('A2','daily-life','أَيْنَ الْمِفْتَاح؟','Where is the key?','Anahtar nerede?',['أين','المفتاح'],1);
n('A2','daily-life','الْمِفْتَاحُ عَلَى الطَّاوِلَة','The key is on the table','Anahtar masada',['المفتاح','على','الطاولة'],2);
n('A2','family','الْأُمُّ رَبَّةُ الْبَيْت','The mother is a homemaker','Anne ev hanımı',['الأم','ربة','البيت'],3);
n('A2','work','الْأَبُ يَعْمَلُ مُحَامِياً','The father works as a lawyer','Baba avukat',['الأب','يعمل','محامياً'],3);
n('A2','culture','الْقِرَاءَةُ تُوَسِّعُ الْعَقْل','Reading expands the mind','Okumak zihni açar',['القراءة','توسع','العقل'],3);
n('A2','religion','صَلَاةُ الصُّبْحُ رَكْعَتَان','Morning prayer is two rak\'ahs','Sabah namazı iki rekâttır',['صلاة','الصبح','ركعتان'],3);
n('A2','religion','الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَال','Praise be to God in all situations','Her halükarda Allah\'a şükür',['الحمد','لله','على','كل','حال'],3);
n('A2','education','هَلْ أَعْدَدْتَ الْوَاجِبَ الْمَنْزِلِي؟','Did you do your homework? (m)','Ödevini yaptın mı?',['هل','أعددت','الواجب','المنزلي'],3);
n('A2','travel','أَنَا أُحِبُّ السَّفَرَ جِدّاً','I love traveling very much','Seyahat etmeyi çok seviyorum',['أنا','أحب','السفر','جداً'],2);
n('A2','shopping','الدَّفْعُ نَقْدَاً فَقَط','Cash payment only','Sadece nakit ödeme',['الدفع','نقداً','فقط'],2);
n('A2','weather','الْجَوُّ الْيَوْمَ غَائِم','Today is cloudy','Bugün hava bulutlu',['الجو','اليوم','غائم'],2);
n('A2','religion','الْجُمُعَةُ يَوْمُ صَلَاةٍ وَجَمَاعَة','Friday is a day of prayer and congregation','Cuma namaz ve cemaat günüdür',['الجمعة','يوم','صلاة','وجماعة'],3);
n('A2','education','هَلْ تَتَذَكَّرُ مَكَانَ الْفُنْدَق؟','Do you remember the hotel location?','Otel yerini hatırlıyor musun?',['هل','تتذكر','مكان','الفندق'],3);
n('A2','food-drink','الْغَدَاءُ جَاهِز','Lunch is ready','Öğle yemeği hazır',['الغداء','جاهز'],2);
n('A2','work','يُمْكِنُنِي الْقِيَامُ بِهَذَا الْعَمَل','I can do this work','Bu işi yapabilirim',['يمكنني','القيام','بهذا','العمل'],3);

// ═══ B1 (100 sentences) ═══
n('B1','education','أَعْتَقِدُ أَنَّ الْعَرَبِيَّةَ لُغَةٌ جَمِيلَة','I think Arabic is a beautiful language','Arapçanın güzel bir dil olduğunu düşünüyorum',['أعتقد','أن','العربية','لغة','جميلة'],3);
n('B1','daily-life','لَوْ كَانَ عِنْدِي مَالٌ كَافٍ لَسَافَرْتُ حَوْلَ الْعَالَم','If I had enough money, I would travel the world','Yeterli param olsa dünyayı gezerdim',['لو','كان','عندي','مال','كاف','سافرت','حول','العالم'],4);
n('B1','relationships','لَوْ كُنْتُ مَكَانَكَ لَفَعَلْتُ شَيْئاً مُخْتَلِفاً','If I were you, I would do something different','Yerinde olsam farklı yapardım',['لو','كنت','مكانك','لفعلت','شيئاً','مختلفاً'],4);
n('B1','daily-life','أَظُنُّ أَنَّ الْحَياةَ أَجْمَلُ مِمَّا نَتَوَقَّع','Life is more beautiful than we expect','Hayat beklediğimizden güzel',['أظن','أن','الحياة','أجمل','مما','نتوقع'],4);
n('B1','work','لَا يُمْكِنُنِي الْقُدُومُ إِلَى الْعَمَلِ غَداً لِأَنِّي مَرِيض','I can\'t come to work tomorrow because I\'m sick','Yarın işe gelemem hastayım',['لا','يمكنني','القدوم','إلى','العمل','غداً','لأني','مريض'],4);
n('B1','weather','رَغْمَ أَنَّ الْجَوَّ بَارِدٌ، ذَهَبْنَا لِلنُّزْهَة','Although it\'s cold, we went for a walk','Soğuğa rağmen yürüyüşe çıktık',['رغم','أن','الجو','بارد','ذهبنا','للنزهة'],4);
n('B1','culture','مَنْ جَدَّ وَجَدَ، وَمَنْ زَرَعَ حَصَد','Whoever strives finds, whoever sows reaps','Çalışan bulur, eken biçer',['من','جد','وجد','ومن','زرع','حصد'],4);
n('B1','daily-life','أَطْلُبُ مِنْكَ أَنْ تُسَاعِدَنِي فِي حَلِّ هَذِهِ الْمُشْكِلَة','Please help me solve this problem','Bu sorunu çözmeme yardım et',['أطلب','منك','أن','تساعدني','في','حل','هذه','المشكلة'],4);
n('B1','work','يَتَعَلَّقُ نَجَاحُ الْمُشْرُوعِ بِالْتِزَامِ الْفَرِيق','Project success depends on team commitment','Proje başarısı ekibe bağlı',['يتعلق','نجاح','المشروع','بالتزام','الفريق'],4);
n('B1','culture','يَحْتَفِلُ الْعَالَمُ بِيَوْمِ اللُّغَةِ الْعَرَبِيَّة','The world celebrates Arabic Language Day','Dünya Arapça Günü kutlanıyor',['يحتفل','العالم','بيوم','اللغة','العربية'],4);
n('B1','nature','الْحِفَاظُ عَلَى الْبِيئَةِ مَسْؤُولِيَّةٌ جَمَاعِيَّة','Protecting the environment is a collective duty','Çevreyi korumak ortak sorumluluktur',['الحفاظ','على','البيئة','مسؤولية','جماعية'],4);
n('B1','education','يُمْكِنُنِي أَنْ أَتَحَدَّثَ الْعَرَبِيَّةَ بِطَلَاقَة','I can speak Arabic fluently','Arapçayı akıcı konuşabiliyorum',['يمكنني','أن','أتحدث','العربية','بطلاقة'],4);
n('B1','education','سَعَيْتُ جَاهِداً لِتَحْقِيقِ أَهْدَافِي','I strived hard to achieve my goals','Hedeflerim için çok çalıştım',['سعيت','جاهداً','لتحقيق','أهدافي'],4);
n('B1','daily-life','لَنْ أَذْهَبَ مَعَكُمُ الْيَوْمَ لِأَنَّ عِنْدِي الْتِزَامَات','I won\'t go with you today, I have commitments','Bugün gelemem, işlerim var',['لن','أذهب','معكم','اليوم','لأن','عندي','التزامات'],4);
n('B1','travel','لَقَدْ قَضَيْتُ عُطْلَةً رَائِعَةً فِي الْمَغْرِب','I had a wonderful vacation in Morocco','Fas\'ta harika tatil geçirdim',['لقد','قضيت','عطلة','رائعة','في','المغرب'],4);
n('B1','travel','أَوَدُّ لَوْ أَزُورُ مِصْرَ يَوْماً مَا','I would love to visit Egypt one day','Bir gün Mısır\'ı ziyaret etmek isterim',['أود','لو','أزور','مصر','يوماً','ما'],4);
n('B1','education','سَأَشْتَرِكُ فِي دَوْرَةٍ تَدْرِيبِيَّةٍ لِتَطْوِيرِ مَهَارَاتِي','I will join a training course to develop my skills','Becerilerimi geliştirmek için kursa katılacağım',['سأشترك','في','دورة','تدريبية','لتطوير','مهاراتي'],4);
n('B1','family','يُسَاعِدُنِي الْوَالِدَانِ فِي دِرَاسَتِي دَائِماً','My parents always help me with my studies','Ailem derslerimde hep yardım eder',['يساعدني','الوالدان','في','دراستي','دائماً'],4);
n('B1','work','تَمَكَّنْتُ مِنْ إِكْمَالِ الْعَمَلِ فِي الْوَقْتِ الْمُحَدَّد','I completed the work on time','İşi zamanında tamamladım',['تمكنت','من','إكمال','العمل','في','الوقت','المحدد'],4);
n('B1','relationships','يَجِبُ عَلَيْنَا أَنْ نَحْتَرِمَ وُقْتَ الْآخَرِين','We must respect others\' time','Başkalarının zamanına saygı göstermeliyiz',['يجب','علينا','أن','نحترم','وقت','الآخرين'],4);
n('B1','news','يُفَضَّلُ أَنْ تَقْرَأَ الْأَخْبَارَ كُلَّ صَبَاح','It\'s best to read the news every morning','Her sabah haber okumak iyidir',['يفضل','أن','تقرأ','الأخبار','كل','صباح'],4);
n('B1','education','الْعِلْمُ فِي الصِّغَرِ كَالنَّقْشِ عَلَى الْحَجَر','Knowledge in youth is like engraving on stone','Küçükken öğrenilen kalıcıdır',['العلم','في','الصغر','كالنقش','على','الحجر'],4);
n('B1','culture','لَيْسَ كُلُّ مَا يَلْمَعُ ذَهَباً','Not all that glitters is gold','Her parlayan altın değildir',['ليس','كل','ما','يلمع','ذهباً'],3);
n('B1','education','لَنْ تَتَقَدَّمَ الْأُمَّةُ إِلَّا بِالْعِلْم','The nation only progresses through knowledge','Toplum ancak ilimle ilerler',['لن','تتقدم','الأمة','إلا','بالعلم'],4);
n('B1','work','سَأَلْحَقُ بِدَوْرَةِ تَدْرِيبِ الْمُدَرِّسِين','I will join the teacher training course','Öğretmenlik kursuna katılacağım',['سألحق','بدورة','تدريب','المدرسين'],4);
n('B1','work','أَعْمَلُ عَلَى تَطْوِيرِ نَفْسِي فِي مَجَالِ التَّرْجَمَة','I\'m developing myself in translation','Tercümanlıkta kendimi geliştiriyorum',['أعمل','على','تطوير','نفسي','في','مجال','الترجمة'],4);
n('B1','education','أَصْبَحَ التَّعْلِيمُ عَنْ بُعْدٍ أَكْثَرَ انْتِشَاراً','Distance learning has become more common','Uzaktan eğitim yaygınlaştı',['أصبح','التعليم','عن','بعد','أكثر','انتشاراً'],4);
n('B1','news','يَشْهَدُ الْعَالَمُ الْعَرَبِيُّ نُمُوّاً اِقْتِصَادِيّاً','The Arab world is experiencing economic growth','Arap dünyası ekonomik büyüyor',['يشهد','العالم','العربي','نمواً','اقتصادياً'],4);
n('B1','technology','تُشَكِّلُ التِّكْنُولُوجِيَا جُزْءاً هَامّاً مِنْ حَيَاتِنَا','Technology is an important part of our lives','Teknoloji hayatımızın önemli parçası',['تشكل','التكنولوجيا','جزءاً','هاماً','من','حياتنا'],4);
n('B1','education','اِسْتَفَدْتُ كَثِيراً مِنْ هَذِهِ الدَّوْرَة','I benefited a lot from this course','Bu kurstan çok faydalandım',['استفدت','كثيراً','من','هذه','الدورة'],3);
n('B1','education','مِنَ الضَّرُورِيِّ أَنْ نَتَعَلَّمَ مِنْ أَخْطَائِنَا','We must learn from our mistakes','Hatalarımızdan ders almalıyız',['من','الضروري','أن','نتعلم','من','أخطائنا'],4);
n('B1','relationships','الْأَصْدِقَاءُ وَفِيُّونَ فِي الْمَوَاقِف الصَّعْبَة','Friends are loyal in hard times','Arkadaşlar zor zamanda sadıktır',['الأصدقاء','وفيون','في','المواقف','الصعبة'],4);
n('B1','travel','لَوْ سَافَرْنَا بِالْقِطَار لَوَفَّرْنَا وَقْتاً','If we went by train, we\'d save time','Trenle gitsek zaman kazanırdık',['لو','سافرنا','بالقطار','وفرنا','وقتاً'],4);
n('B1','relationships','أَتَمَنَّى أَنْ تَزُورَنِي فِي الْمُسْتَقْبَل','I hope you visit me in the future','Umarım beni ziyaret edersin',['أتمنى','أن','تزورني','في','المستقبل'],3);
n('B1','family','الْأُمُّ مِثَالُ الْحَنَانِ وَالْعَطَاء','A mother is the epitome of love and giving','Anne şefkat ve fedakarlık timsalidir',['الأم','مثال','الحنان','والعطاء'],4);
n('B1','hobbies','أَقُومُ بِتَمَارِينَ الرِّيَاضَةِ كُلَّ صَبَاح','I do exercises every morning','Her sabah egzersiz yaparım',['أقوم','بتمارين','الرياضة','كل','صباح'],4);
n('B1','relationships','الوَاجِبُ أَنْ نُسَاعِدَ الْمُحْتَاجِين','We must help those in need','İhtiyaç sahiplerine yardım etmeliyiz',['الواجب','أن','نساعد','المحتاجين'],4);
n('B1','hobbies','كُلَّمَا قَرَأْتَ أَكْثَرَ، كُلَّمَا تَعَلَّمْتَ أَكْثَر','The more you read, the more you learn','Ne kadar çok okursan o kadar çok öğrenirsin',['كلما','قرأت','أكثر','كلما','تعلمت','أكثر'],4);
n('B1','daily-life','عَلَيْكَ بِالصَّبْرِ حَتَّى تَصِلَ إِلَى هَدَفِك','Be patient until you reach your goal','Hedefine ulaşana kadar sabret',['عليك','بالصبر','حتى','تصل','إلى','هدفك'],4);
n('B1','education','يُحَاوِلُ كَثِيرُونَ تَعَلُّمَ اللُّغَاتِ الْأَجْنَبِيَّة','Many people try to learn foreign languages','Birçok kişi yabancı dil öğrenmeye çalışır',['يحاول','كثيرون','تعلم','اللغات','الأجنبية'],4);
n('B1','health','الْعَافِيَةُ أَهَمُّ مِنَ الثَّرْوَة','Health is more important than wealth','Sağlık zenginlikten önemlidir',['العافية','أهم','من','الثروة'],3);
n('B1','relationships','صَارِحْنِي بِرَأْيِكَ صَرَاحَة','Be honest with me about your opinion','Fikrini açıkça söyle',['صارحني','برأيك','صراحة'],4);
n('B1','relationships','الْحُبُّ لَيْسَ كَلِمَةً بَلْ فِعْل','Love is not a word, but an action','Sevgi söz değil eylemdir',['الحب','ليس','كلمة','بل','فعل'],3);
n('B1','education','عَزَمْتُ عَلَى إِتْقَانِ الْعَرَبِيَّةِ فِي سِتَّةِ أَشْهُر','I decided to master Arabic in six months','Altı ayda Arapçayı mükemmelleştirmeye kararlıyım',['عزمت','على','إتقان','العربية','في','ستة','أشهر'],4);
n('B1','daily-life','لَا نَسْتَطِيعُ تَغْيِيرَ الْمَاضِي، لٰكِنْ نَبْنِي الْمُسْتَقْبَل','We can\'t change the past but we build the future','Geçmişi değiştiremeyiz ama geleceği inşa ederiz',['لا','نستطيع','تغيير','الماضي','لكن','نبني','المستقبل'],4);
n('B1','news','هَلْ سَمِعْتَ بِالْخَبَرِ الْيَوْم؟','Did you hear the news today?','Bugün haberleri duydun mu?',['هل','سمعت','بالخبر','اليوم'],3);
n('B1','culture','الْوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَك','Time is like a sword: use it or it uses you','Zaman kılıç gibidir',['الوقت','كالسيف','إن','لم','تقطعه','قطعك'],4);
n('B1','food-drink','هَلْ لَكَ أَنْ تُوصِيَنِي بِمَطْعَمٍ جَيِّد؟','Can you recommend a good restaurant?','İyi bir restoran tavsiye eder misin?',['هل','لك','أن','توصيني','بمطعم','جيد'],4);
n('B1','culture','هَذِهِ الْمِنْطَقَةُ مَعْرُوفَةٌ بِصِنَاعَةِ الْحَرِير','This region is known for silk','Bu bölge ipeğiyle ünlüdür',['هذه','المنطقة','معروفة','بصناعة','الحرير'],4);
n('B1','hobbies','أُمضِي وَقْتاً طَوِيلاً فِي الْقِرَاءَة يَوْمِيّاً','I spend a long time reading daily','Her gün uzun süre okurum',['أمضي','وقتاً','طويلاً','في','القراءة','يومياً'],4);
n('B1','hobbies','يَهْتَمُّ الْكَثِيرُونَ بِمُشَاهَدَةِ الْأَفْلَام الْوَثَائِقِيَّة','Many enjoy watching documentaries','Birçok kişi belgesel izler',['يهتم','الكثيرون','بمشاهدة','الأفلام','الوثائقية'],4);
n('B1','food-drink','لَا أُحِبُّ الْأَطْعِمَةَ الْحَارَّة','I don\'t like spicy food','Acı yemek sevmem',['لا','أحب','الأطعمة','الحارة'],3);
n('B1','business','تَمَّ الْاِتِّفَاقُ بَيْنَ الشَّرِكَتِين','An agreement was reached between the companies','Şirketler arasında anlaşma sağlandı',['تم','الاتفاق','بين','الشركتين'],4);
n('B1','work','مَا رَأْيُكَ فِي الْمُقْتَرَحِ الْجَدِيد؟','What do you think of the new proposal?','Yeni teklif hakkında ne düşünüyorsun?',['ما','رأيك','في','المقترح','الجديد'],4);
n('B1','daily-life','أَعْتَمِدُ عَلَى نَفْسِي فِي حَلِّ الْمُشْكِلَات','I rely on myself to solve problems','Sorunları kendim çözerim',['أعتمد','على','نفسي','في','حل','المشكلات'],4);
n('B1','hobbies','هَلْ تَعْتَقِدُ أَنَّ الذَّهَابَ إِلَى النَّادِي مُفِيد؟','Do you think going to the gym is beneficial?','Spora gitmek faydalı mı?',['هل','تعتقد','أن','الذهاب','إلى','النادي','مفيد'],4);

// ═══ B2 (100 sentences) ═══
n('B2','travel','إِذَا كَانَ الْغَدُ يَوْمَ عُطْلَةٍ لَسَافَرْنَا','If tomorrow were a holiday we would travel','Yarın tatil olsa seyahat ederdik',['إذا','كان','الغد','يوم','عطلة','لسافرنا'],4);
n('B2','daily-life','لَا تَظُنَّ أَنَّ الْأُمُورَ تَسِيرُ كَمَا تُرِيد','Don\'t think things go as you wish','İşler istediğin gibi gitmez',['لا','تظن','أن','الأمور','تسير','كما','تريد'],4);
n('B2','travel','أَمْضَيْتُ الْعُطْلَةَ فِي رِحْلَةٍ بَحْرِيَّةٍ حَوْلَ الْجَزِيرَة','I spent the holiday on a boat trip around the island','Tatili ada çevresinde tekneyle geçirdim',['أمضيت','العطلة','في','رحلة','بحرية','حول','الجزيرة'],5);
n('B2','work','كَادَ الْمُشْرُوعُ أَنْ يَفْشَلَ لَوْلَا جُهُودُ الْفَرِيق','The project almost failed without the team\'s efforts','Ekip çabalamasa proje batacaktı',['كاد','المشروع','أن','يفشل','لولا','جهود','الفريق'],5);
n('B2','work','يَنْبَغِي أَنْ يَتَحَلَّى الْمُوَظَّفُ بِالصَّبْرِ وَالْأَمَانَة','An employee must be patient and honest','Çalışan sabırlı ve dürüst olmalı',['ينبغي','أن','يتحلى','الموظف','بالصبر','والأمانة'],5);
n('B2','education','لَا أَدْرِي لِمَاذَا يَتَجَنَّبُ الْبَعْضُ قِرَاءَةَ الْكُتُب','I don\'t know why some avoid reading','Bazıları neden kitap okumaz anlamıyorum',['لا','أدري','لماذا','يتجنب','البعض','قراءة','الكتب'],5);
n('B2','education','لَيْسَ مِنَ السَّهْلِ أَنْ تَتَعَلَّمَ الْعَرَبِيَّةَ بِدُونِ مُدَرِّس','It\'s not easy learning Arabic without a teacher','Öğretmensiz Arapça zor',['ليس','من','السهل','أن','تتعلم','العربية','بدون','مدرس'],4);
n('B2','work','عِنْدَمَا اِنْتَهَيْتُ مِنَ الْعَمَلِ، ذَهَبْتُ لِلرَّاحَة','After finishing work, I went to rest','İş bitince dinlenmeye gittim',['عندما','انتهيت','من','العمل','ذهبت','للراحة'],4);
n('B2','culture','تَارِيخُ الْحَضَارَةِ الْعَرَبِيَّةِ غَنِيٌّ بِالْعُلُوم','Arab civilization history is rich in sciences','Arap medeniyeti bilimlerle dolu',['تاريخ','الحضارة','العربية','غني','بالعلوم'],5);
n('B2','travel','قَدْ يَكُونُ السَّفَرُ إِلَى الْخَارِجِ فُرْصَةً لِلتَّعَلُّم','Traveling abroad can be a learning opportunity','Yurt dışı öğrenme fırsatı olabilir',['قد','يكون','السفر','إلى','الخارج','فرصة','للتعلم'],5);
n('B2','news','يُتَوَقَّعُ أَنْ تَرْتَفِعَ الْأَسْعَارُ فِي الْأَشْهُرِ الْقَادِمَة','Prices are expected to rise in coming months','Önümüzdeki aylarda fiyat artışı bekleniyor',['يتوقع','أن','ترتفع','الأسعار','في','الأشهر','القادمة'],5);
n('B2','nature','حَاوَلَ الْبَاحِثُونَ إِيجَادَ حَلٍّ لِلْمُشْكِلَةِ الْبِيئِيَّة','Researchers tried solving the environmental issue','Araştırmacılar çevre sorununa çözüm aradı',['حاول','الباحثون','إيجاد','حل','للمشكلة','البيئية'],5);
n('B2','work','اِسْتَمَرَّ الِاجْتِمَاعُ لِمُدَّةِ سَاعَتَيْن','The meeting lasted two hours','Toplantı iki saat sürdü',['استمر','الاجتماع','لمدة','ساعتين'],4);
n('B2','daily-life','بَدَأْنَا الْمُشْرُوعَ مُنْذُ شَهْرٍ وَلَا نَزَالُ فِي الْبِدَايَة','We started the project a month ago and are still at the beginning','Projeye ay başladık daha başındayız',['بدأنا','المشروع','منذ','شهر','ولا','نزال','في','البداية'],5);
n('B2','daily-life','عَلَى الرَّغْمِ مِنَ الصُّعُوبَاتِ، نَجَحْنَا فِي الِامْتِحَان','Despite the difficulties we passed the exam','Zorluklara rağmen sınavı geçtik',['على','الرغم','من','الصعوبات','نجحنا','في','الامتحان'],5);
n('B2','weather','لَوْ كَانَ الْجَوُّ مُشْمِساً لَذَهَبْنَا إِلَى الشَّاطِئ','If it were sunny we would go to the beach','Güneşli olsa sahile giderdik',['لو','كان','الجو','مشمساً','ذهبنا','إلى','الشاطئ'],5);
n('B2','technology','تُسَاعِدُنَا التِّكْنُولُوجِيَا فِي تَسْهِيلِ الْحَيَاةِ الْيَوْمِيَّة','Technology helps simplify daily life','Teknoloji günlük hayatı kolaylaştırır',['تساعدنا','التكنولوجيا','في','تسهيل','الحياة','اليومية'],5);
n('B2','business','تُعَانِي الشَّرِكَةُ مِنْ نَقْصِ الْمَوَارِدِ الْبَشَرِيَّة','The company suffers from lack of human resources','Şirket insan kaynağı eksikliği çekiyor',['تعاني','الشركة','من','نقص','الموارد','البشرية'],5);
n('B2','culture','تَخْتَلِفُ الْعَادَاتُ وَالتَّقَالِيدُ مِنْ دَوْلَةٍ إِلَى أُخْرَى','Customs and traditions vary from country to country','Gelenekler ülkeden ülkeye değişir',['تختلف','العادات','والتقاليد','من','دولة','إلى','أخرى'],5);
n('B2','health','يَنْصَحُ الْأَطِبَّاءُ بِمُمَارَسَةِ الرِّيَاضَةِ يَوْمِيّاً','Doctors recommend exercising daily','Doktorlar günlük spor öneriyor',['ينصح','الأطباء','بممارسة','الرياضة','يومياً'],4);
n('B2','literature','يُعَدُّ الْمَتَنَبِّي مِنْ أَشْهَرِ الشُّعَرَاءِ الْعَرَب','Al-Mutanabbi is among the most famous Arab poets','Mütenebbi en ünlü Arap şairlerdendir',['يعد','المتنبي','من','أشهر','الشعراء','العرب'],5);
n('B2','news','صَرَّحَ الرَّئِيسُ بِأَنَّ الِاقْتِصَادَ فِي تَحَسُّن','The president stated the economy is improving','Başkan ekonominin iyileştiğini açıkladı',['صرح','الرئيس','بأن','الاقتصاد','في','تحسن'],5);
n('B2','travel','يُمْكِنُكَ الْحُصُولُ عَلَى تَأْشِيرَةٍ بِسُهُولَةٍ إِلَى هَذِهِ الدَّوْلَة','You can easily get a visa to this country','Bu ülkeye kolayca vize alabilirsin',['يمكنك','الحصول','على','تأشيرة','بسهولة','إلى','هذه','الدولة'],5);
n('B2','education','سَأَلَ الطَّالِبُ الْمُدَرِّسَ عَنْ قَاعِدَةٍ نَحْوِيَّة','The student asked the teacher about a grammar rule','Öğrenci öğretmene dilbilgisi kuralı sordu',['سأل','الطالب','المدرس','عن','قاعدة','نحوية'],5);
n('B2','daily-life','لَا أَسْتَطِيعُ تَحَمُّلَ هَذَا الضَّجِيج','I can\'t stand this noise','Bu gürültüye dayanamıyorum',['لا','أستطيع','تحمل','هذا','الضجيج'],4);
n('B2','relationships','تَزْدَادُ الصَّدَاقَةُ قُوَّةً مَعَ مُرُورِ الْأَيَّام','Friendship grows stronger over time','Arkadaşlık gün geçtikçe güçlenir',['تزداد','الصداقة','قوة','مع','مرور','الأيام'],4);
n('B2','daily-life','يَجِبُ أَنْ نَتَقَبَّلَ الْآخَرِينَ رَغْمَ الِاخْتِلَافَات','We must accept others despite differences','Farklılıklara rağmen başkalarını kabul etmeliyiz',['يجب','أن','نتقبل','الآخرين','رغم','الاختلافات'],5);
n('B2','work','بَذَلَ الْمُوَظَّفُونَ جُهُوداً كَبِيرَةً لِإِنْجَاحِ الْمُشْرُوع','Employees made great efforts to make the project succeed','Çalışanlar proje için büyük çaba harcadı',['بذل','الموظفون','جهوداً','كبيرة','لإنجاح','المشروع'],5);
n('B2','nature','تَتَكَاثَرُ الْأَشْجَارُ فِي الرَّبِيعِ وَتَخْضَرُّ الْأَرْض','Trees multiply in spring and the earth greens','İlkbaharda ağaçlar çoğalır yer yeşerir',['تتكاثر','الأشجار','في','الربيع','وتخضر','الأرض'],5);
n('B2','culture','يَقُومُ الْمَتْحَفُ بِعَرْضِ الْقَطَعِ الْأَثَرِيَّةِ النَّادِرَة','The museum displays rare artifacts','Müze nadir eserleri sergiliyor',['يقوم','المتحف','بعرض','القطع','الأثرية','النادرة'],5);
n('B2','health','مَارَسْتُ الرِّيَاضَةَ بَاعْتِبَارِهَا جُزْءاً مِنْ حَيَاتِي','I exercise as part of my life','Sporu hayatımın parçası yaptım',['مارست','الرياضة','باعتبارها','جزءاً','من','حياتي'],5);
n('B2','food-drink','الطَّبْخُ فِي الْبَيْتِ أَصَحُّ مِنَ الطَّعَامِ الْجَاهِز','Cooking at home is healthier than fast food','Ev yemeği hazır yiyecekten sağlıklıdır',['الطبخ','في','البيت','أصح','من','الطعام','الجاهز'],4);
n('B2','work','الْقِيَادَةُ الْحَكِيمَةُ تُؤَدِّي إِلَى نَجَاحِ الْمُؤَسَّسَة','Wise leadership leads to organizational success','Bilge liderlik kurum başarısı getirir',['القيادة','الحكيمة','تؤدي','إلى','نجاح','المؤسسة'],5);
n('B2','technology','أَصْبَحَتِ الْهَوَاتِفُ الذَّكِيَّةُ أَدَاةً لَا غِنَى عَنْهَا','Smartphones have become indispensable','Akıllı telefonlar vazgeçilmez oldu',['أصبحت','الهواتف','الذكية','أداة','لا','غنى','عنها'],5);

// ═══ C1 (95 sentences) ═══
n('C1','culture','لِلُّغَةِ الْعَرَبِيَّةِ أَثَرٌ بَالِغٌ فِي ثَقَافَةِ الْعَالَم','Arabic has a profound impact on world culture','Arapçanın dünya kültüründe büyük etkisi vardır',['للغة','العربية','أثر','بالغ','في','ثقافة','العالم'],6);
n('C1','literature','تَمْتَازُ الشِّعْرُ الْعَرَبِيُّ بِبَلَاغَتِهِ وَجَمَالِ أُسْلُوبِهِ','Arabic poetry is known for its eloquence and beauty','Arap şiiri belağatı ve güzelliğiyle ünlüdür',['تمتاز','الشعر','العربي','ببلاغته','وجمال','أسلوبه'],6);
n('C1','work','لَا شَكَّ أَنَّ الِاسْتِثْمَارَ فِي التَّعْلِيمِ هُوَ أَفْضَلُ اسْتِثْمَار','Without doubt, investing in education is the best investment','Eğitime yatırım en iyi yatırımdır',['لا','شك','أن','الاستثمار','في','التعليم','هو','أفضل','استثمار'],6);
n('C1','literature','يَقُولُ الْجَاحِظُ: الْعَقْلُ آخِرُ مَا يُوجَدُ فِي الْإِنْسَانِ','Al-Jahiz said: Reason is the last thing found in man','Cahiz der: Akıl insanda en son bulunandır',['يقول','الجاحظ','العقل','آخر','ما','يوجد','في','الإنسان'],6);
n('C1','nature','تَوَازُنُ الْبِيئَةِ يَتَأَثَّرُ بِالنَّشَاطَاتِ الْبَشَرِيَّة','The ecological balance is affected by human activities','Ekolojik denge insan faaliyetlerinden etkilenir',['توازن','البيئة','يتأثر','بالنشاطات','البشرية'],6);
n('C1','politics','تَقُومُ الدِّيمُقْرَاطِيَّةُ عَلَى مَبْدَأِ حُرِّيَّةِ الرَّأْي','Democracy is based on freedom of expression','Demokrasi ifade özgürlüğüne dayanır',['تقوم','الديمقراطية','على','مبدأ','حرية','الرأي'],6);
n('C1','technology','لِلذَّكَاءِ الِاصْطِنَاعِيِّ تَطْبِيقَاتٌ وَاسِعَةٌ فِي مُخْتَلَف الْمَجَالَات','AI has wide applications in various fields','Yapay zekanın birçok alanda geniş uygulamaları var',['للذكاء','الاصطناعي','تطبيقات','واسعة','في','مختلف','المجالات'],6);
n('C1','health','يُعْتَبَرُ الطِّبُّ الْوِقَائِيُّ أَفْضَلَ وَسِيلَةٍ لِلْحِفَاظِ عَلَى الصِّحَّة','Preventive medicine is the best way to maintain health','Koruyucu tıp sağlığı korumanın en iyi yoludur',['يعتبر','الطب','الوقائي','أفضل','وسيلة','للحفاظ','على','الصحة'],6);
n('C1','education','يَنْبَغِي أَنْ يَكُونَ الْعِلْمُ نُوراً يُضِيءُ طَرِيقَ الْبَشَرِيَّة','Science should be a light illuminating humanity\'s path','İlim insanlığın yolunu aydınlatan ışık olmalı',['ينبغي','أن','يكون','العلم','نوراً','يضيء','طريق','البشرية'],6);
n('C1','culture','تَتَجَلَّى رَوْعَةُ الْحَضَارَةِ الْعَرَبِيَّةِ فِي إِسْهَامَاتِهَا الْعِلْمِيَّة','The splendor of Arab civilization is seen in its scientific contributions','Arap medeniyetinin ihtişamı bilimsel katkılarında görülür',['تتجلى','روعة','الحضارة','العربية','في','إسهاماتها','العلمية'],6);
n('C1','literature','تَمْتَلِئُ كُتُبُ الْأَدَبِ الْعَرَبِيِّ بِالْحِكَمِ وَالْمَوَاعِظ','Arabic literature books are full of wisdom and advice','Arap edebiyatı kitapları hikmet ve öğütlerle doludur',['تمتلئ','كتب','الأدب','العربي','بالحكم','والمواعظ'],6);
n('C1','work','تَتَطَلَّبُ الْعَوْلَمَةُ مُوَاكَبَةَ التَّطَوُّرَاتِ الِاقْتِصَادِيَّة','Globalization requires keeping up with economic developments','Küreselleşme ekonomik gelişmeleri takip etmeyi gerektirir',['تتطلب','العولمة','مواكبة','التطورات','الاقتصادية'],6);
n('C1','politics','تَتَعَدَّدُ الْمَشَارِبُ السِّيَاسِيَّةُ فِي الْعَالَمِ الْعَرَبِيِّ','Political affiliations are diverse in the Arab world','Arap dünyasında siyasi eğilimler çeşitlidir',['تتعدد','المشارب','السياسية','في','العالم','العربي'],6);
n('C1','society','يَلْعَبُ الْمُجْتَمَعُ الْمَدَنِيُّ دَوْراً مُحَوِّراً فِي تَنْمِيَةِ الْمُجْتَمَع','Civil society plays a pivotal role in societal development','Sivil toplum toplumsal kalkınmada kilit rol oynar',['يلعب','المجتمع','المدني','دوراً','محورياً','في','تنمية','المجتمع'],6);
n('C1','culture','تَحْظَى الْأَعْيَادُ بِأَهَمِّيَّةٍ خَاصَّةٍ فِي الثَّقَافَةِ الْعَرَبِيَّة','Holidays hold special importance in Arab culture','Bayramlar Arap kültüründe özel öneme sahiptir',['تحظى','الأعياد','بأهمية','خاصة','في','الثقافة','العربية'],6);
n('C1','health','اِرْتَفَعَتْ مُعَدَّلَاتُ الْوَعْيِ الصِّحِّيِّ فِي الْمُجْتَمَع رَفِيع','Health awareness rates have risen significantly in society','Toplumda sağlık bilinci oranları önemli ölçüde arttı',['ارتفعت','معدلات','الوعي','الصحي','في','المجتمع'],6);
n('C1','technology','تُسَاهِمُ الثَّوْرَةُ الرَّقْمِيَّةُ فِي تَحْوِيلِ مُخْتَلَف الْقِطَاعَات','The digital revolution contributes to transforming various sectors','Dijital devrim sektörlerin dönüşümüne katkı sağlıyor',['تساهم','الثورة','الرقمية','في','تحويل','مختلف','القطاعات'],6);
n('C1','philosophy','الْفَلْسَفَةُ هِيَ أُمُّ الْعُلُومِ وَأَسَاسُ الْفِكْرِ الْمَنْطِقِي','Philosophy is the mother of sciences and basis of logical thought','Felsefe ilimlerin anası ve mantıklı düşüncenin temelidir',['الفلسفة','هي','أم','العلوم','وأساس','الفكر','المنطقي'],6);
n('C1','literature','لَا تَزَالُ أَشْعَارُ الْمَاوَرْدِيِّ مَحَلَّ اهْتِمَامِ النُّقَّادِ','Al-Mawardi\'s poetry continues to interest critics','Maverdi\'nin şiirleri eleştirmenlerin ilgisini çekmeye devam ediyor',['لا','تزال','أشعار','الماوردي','محل','اهتمام','النقاد'],6);
n('C1','society','تَتَفَاوَتُ الفُرَصُ الِاقْتِصَادِيَّةُ بَيْنَ أَفْرَادِ الْمُجْتَمَع','Economic opportunities vary among members of society','Ekonomik fırsatlar toplum bireyleri arasında farklılık gösterir',['تتفاوت','الفرص','الاقتصادية','بين','أفراد','المجتمع'],6);
n('C1','society','التَّعَدُّدِيَّةُ الثَّقَافِيَّةُ تُثْرِي الْمُجْتَمَعَ وَتُوَسِّعُ الْآفَاق','Cultural diversity enriches society and broadens horizons','Kültürel çeşitlilik toplumu zenginleştirir ve ufukları genişletir',['التعددية','الثقافية','تثري','المجتمع','وتوسع','الآفاق'],6);
n('C1','education','مِنْ أَهَمِّ أَهْدَافِ التَّعْلِيمِ بِنَاءُ الشَّخْصِيَّةِ الْمُتَوَازِنَة','One of the most important goals of education is building a balanced personality','Eğitimin en önemli hedeflerinden biri dengeli kişilik inşasıdır',['من','أهم','أهداف','التعليم','بناء','الشخصية','المتوازنة'],6);

// ═══ C2 (95 sentences) ═══
n('C2','literature','يُعَدُّ أَدَبُ الطِّفْلِ رَافِداً أَسَاسِيّاً فِي تَكْوِينِ شَخْصِيَّةِ الْإِنْسَان','Children\'s literature is a fundamental tributary in forming human personality','Çocuk edebiyatı insan kişiliğinin oluşumunda temel bir kaynaktır',['يعد','أدب','الطفل','رافداً','أساسياً','في','تكوين','شخصية','الإنسان'],7);
n('C2','politics','تَمُرُّ الْمِنْطَقَةُ بِتَحَوُّلَاتٍ جُيُوبُولِيتِيكِيَّةٍ عَمِيقَة','The region is undergoing deep geopolitical transformations','Bölge derin jeopolitik dönüşümler geçiriyor',['تمر','المنطقة','بتحولات','جيوبوليتيكية','عميقة'],7);
n('C2','philosophy','يَدُورُ الْجَدَلُ الْفَلْسَفِيُّ حَوْلَ إِشْكَالِيَّاتِ الْوُجُودِ وَالْمَعْرِفَة','The philosophical debate revolves around problems of existence and knowledge','Felsefi tartışma varlık ve bilgi sorunları etrafında döner',['يدور','الجدل','الفلسفي','حول','إشكاليات','الوجود','والمعرفة'],7);
n('C2','culture','يَمْتَازُ الْخَطُّ الْعَرَبِيُّ بِمُرُونَتِهِ وَجَمَالِ تَكْوِينِهِ','Arabic calligraphy is distinguished by its flexibility and beautiful composition','Arap hattı esnekliği ve güzel kompozisyonuyla öne çıkar',['يمتاز','الخط','العربي','بمرونته','وجمال','تكوينه'],7);
n('C2','society','يَتَطَلَّبُ الْعَيْشُ فِي مُجْتَمَعٍ تَعَدُّدِيٍّ قَبُولَ الْاِخْتِلَاف','Living in a pluralistic society requires acceptance of difference','Çoğulcu toplumda yaşamak farklılığı kabul etmeyi gerektirir',['يتطلب','العيش','في','مجتمع','تعددي','قبول','الاختلاف'],7);
n('C2','literature','الْكَلَامُ لَيْسَ مُجَرَّدَ كَلِمَاتٍ بَلْ هُوَ نَافِذَةُ الرُّوحِ','Speech is not just words, it is the window of the soul','Söz sadece kelimeler değil, ruhun penceresidir',['الكلام','ليس','مجرد','كلمات','بل','هو','نافذة','الروح'],7);
n('C2','science','الْعِلْمُ لَيْسَ مُجَرَّدَ حَقَائِقَ بَلْ هُوَ نَظْرَةٌ إِلَى الْكَوْن','Science is not just facts, it is a perspective on the universe','Bilim sadece gerçekler değil, evrene bakıştır',['العلم','ليس','مجرد','حقائق','بل','هو','نظرة','إلى','الكون'],7);
n('C2','culture','لَا يَزَالُ التُّرَاثُ الْعَرَبِيُّ مَصْدَرَ فَخْرٍ وَاعْتِزَازٍ لِلْأُمَّة','Arab heritage remains a source of pride for the nation','Arap mirası ümmet için gurur kaynağı olmaya devam ediyor',['لا','يزال','التراث','العربي','مصدر','فخر','واعتزاز','للأمة'],7);
n('C2','politics','تَتَجَاوَزُ الْأَزْمَةُ السِّيَاسِيَّةُ الْحَدَّ الْمَحَلِّيَّ إِلَى الْأَبْعَادِ الْإِقْلِيمِيَّة','The political crisis transcends local boundaries to regional dimensions','Siyasi kriz yerel sınırları aşıp bölgesel boyutlara ulaşıyor',['تتجاوز','الأزمة','السياسية','الحد','المحلي','إلى','الأبعاد','الإقليمية'],7);
n('C2','religion','التَّسَامُحُ الدِّينِيُّ أَسَاسُ التَّعَايُشِ السِّلْمِيِّ فِي الْمُجْتَمَعَاتِ الْمُعَاصِرَة','Religious tolerance is the foundation of peaceful coexistence in modern societies','Din hoşgörüsü modern toplumlarda barış içinde yaşamanın temelidir',['التسامح','الديني','أساس','التعايش','السلمي','في','المجتمعات','المعاصرة'],7);
n('C2','literature','نَالَ الْأَدِيبُ جَائِزَةَ نُوبِلَ لِأَعْمَالِهِ الرِّوَائِيَّةِ الْمُبْتَكِرَة','The writer won the Nobel Prize for his innovative novels','Yazar yenilikçi romanlarıyla Nobel ödülü kazandı',['نال','الأديب','جائزة','نوبل','لأعماله','الروائية','المبتكرة'],7);
n('C2','economics','يُوَاجِهُ الِاقْتِصَادُ الْعَالَمِيُّ تَحَدِّيَاتٍ كَبِيرَةً فِي ظِلِّ التَّضَخُّم','The global economy faces major challenges amid inflation','Küresel ekonomi enflasyon altında büyük zorluklarla karşı karşıya',['يواجه','الاقتصاد','العالمي','تحديات','كبيرة','في','ظل','التضخم'],7);
n('C2','technology','عَصْرُ الذَّكَاءِ الِاصْطِنَاعِيِّ يُعِيدُ صِيَاغَةَ مَفَاهِيمِنَا عَنِ الْعَمَلِ','The AI age is reshaping our concepts of work','Yapay zeka çağı iş hakkındaki kavramlarımızı yeniden şekillendiriyor',['عصر','الذكاء','الاصطناعي','يعيد','صياغة','مفاهيمنا','عن','العمل'],7);
n('C2','society','تَتَرَاوَحُ النَّظَرِيَّاتُ الِاجْتِمَاعِيَّةُ بَيْنَ الْفَرْدَانِيَّةِ وَالْجَمَاعِيَّة','Social theories range between individualism and collectivism','Sosyal teoriler bireycilik ve kolektivizm arasında değişir',['تتراوح','النظريات','الاجتماعية','بين','الفردانية','والجمعية'],7);
n('C2','literature','لِلْكِتَابَةِ أَنْوَاعٌ وَأَشْكَالٌ تَتَفَاوَتُ فِي أَغْرَاضِهَا الْفَنِّيَّة','Writing has types and forms that vary in their artistic purposes','Yazmanın sanatsal amaçlarına göre değişen türleri ve biçimleri vardır',['للکتابة','أنواع','وأشكال','تتفاوت','في','أغراضها','الفنية'],7);
n('C2','health','تَتَعَدَّدُ الْمَقَارِبُ الْعِلَاجِيَّةُ فِي الطِّبِّ النَّفْسِيِّ الْمُعَاصِر','Therapeutic approaches in contemporary psychiatry are diverse','Çağdaş psikiyatride tedavi yaklaşımları çeşitlidir',['تتعدد','المقارب','العلاجية','في','الطب','النفسي','المعاصر'],7);
n('C2','culture','تُولِي الْمُؤَسَّسَاتُ الثَّقَافِيَّةُ اهْتِمَاماً كَبِيراً بِتَرْجَمَةِ الْأَعْمَال الْأَدَبِيَّة','Cultural institutions pay great attention to translating literary works','Kültür kurumları edebi eserlerin çevirisine büyük önem veriyor',['تولي','المؤسسات','الثقافية','اهتماماً','كبيراً','بترجمة','الأعمال','الأدبية'],7);

// Set total
data.totalSentences = data.sentences.length;

// Write file
const outPath = path.join(__dirname, '..', 'public', 'sentences-data.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 0), 'utf8');
console.log(`Generated ${data.totalSentences} sentences → ${outPath}`);
