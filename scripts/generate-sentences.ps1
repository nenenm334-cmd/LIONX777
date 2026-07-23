$sentences = New-Object System.Collections.ArrayList

function AddSentence($level, $cat, $ar, $en, $tr, $words, $diff) {
  $id = "L$level-" + $sentences.Count.ToString("D3")
  $null = $sentences.Add(@{
    id = $id
    ar = $ar
    en = $en
    tr = $tr
    level = $level
    category = $cat
    words = $words
    difficulty = $diff
    audioUrl = ""
    ipa = ""
  })
}

# A1
AddSentence "A1" "greetings" "السلام عليكم" "Peace be upon you" "Selamün aleyküm" @("السلام","عليكم") 1
AddSentence "A1" "greetings" "كيف حالك؟" "How are you?" "Nasılsın?" @("كيف","حالك") 1
AddSentence "A1" "greetings" "أنا بخير، شكراً" "I'm fine, thanks" "İyiyim, teşekkürler" @("أنا","بخير","شكراً") 1
AddSentence "A1" "greetings" "ما اسمك؟" "What's your name?" "Adın ne?" @("ما","اسمك") 1
AddSentence "A1" "greetings" "اسمي أحمد" "My name is Ahmed" "Adım Ahmed" @("اسمي","أحمد") 1
AddSentence "A1" "greetings" "أهلاً وسهلاً" "Welcome" "Hoş geldin" @("أهلاً","سهلاً") 1
AddSentence "A1" "greetings" "مع السلامة" "Goodbye" "Güle güle" @("مع","السلامة") 1
AddSentence "A1" "greetings" "صباح الخير" "Good morning" "Günaydın" @("صباح","الخير") 1
AddSentence "A1" "greetings" "مساء الخير" "Good evening" "İyi akşamlar" @("مساء","الخير") 1
AddSentence "A1" "greetings" "شكراً جزيلاً" "Thank you very much" "Çok teşekkürler" @("شكراً","جزيلاً") 1
AddSentence "A1" "family" "هذا بيتي" "This is my house" "Burası evim" @("هذا","بيتي") 1
AddSentence "A1" "family" "هذه أختي" "This is my sister" "Bu kız kardeşim" @("هذه","أختي") 1
AddSentence "A1" "family" "هذا أخي" "This is my brother" "Bu erkek kardeşim" @("هذا","أخي") 1
AddSentence "A1" "family" "أنا أحب أمي" "I love my mother" "Annemi seviyorum" @("أنا","أحب","أمي") 1
AddSentence "A1" "family" "هذا والدي" "This is my father" "Bu babam" @("هذا","والدي") 1
AddSentence "A1" "education" "أنا طالب" "I am a student" "Ben öğrenciyim" @("أنا","طالب") 1
AddSentence "A1" "education" "هذا كتاب" "This is a book" "Bu bir kitap" @("هذا","كتاب") 1
AddSentence "A1" "education" "هذه مدرسة" "This is a school" "Bu bir okul" @("هذه","مدرسة") 1
AddSentence "A1" "education" "هل تتكلم العربية؟" "Do you speak Arabic?" "Arapça konuşuyor musun?" @("هل","تتكلم","العربية") 1
AddSentence "A1" "education" "أنا أتعلم العربية" "I'm learning Arabic" "Arapça öğreniyorum" @("أنا","أتعلم","العربية") 1
AddSentence "A1" "education" "هذا قلم جميل" "This is a nice pen" "Bu güzel bir kalem" @("هذا","قلم","جميل") 1
AddSentence "A1" "daily-life" "أين الحمام؟" "Where is the bathroom?" "Banyo nerede?" @("أين","الحمام") 1
AddSentence "A1" "daily-life" "الجو حار" "The weather is hot" "Hava sıcak" @("الجو","حار") 1
AddSentence "A1" "daily-life" "كم عمرك؟" "How old are you?" "Kaç yaşındasın?" @("كم","عمرك") 1
AddSentence "A1" "daily-life" "أين تسكن؟" "Where do you live?" "Nerede oturuyorsun?" @("أين","تسكن") 1
AddSentence "A1" "daily-life" "أنا فرحان" "I'm happy" "Mutluyum" @("أنا","فرحان") 1
AddSentence "A1" "daily-life" "أنا تعبان" "I'm tired" "Yorgunum" @("أنا","تعبان") 1
AddSentence "A1" "food-drink" "أريد ماء" "I want water" "Su istiyorum" @("أريد","ماء") 1
AddSentence "A1" "food-drink" "هل تشرب قهوة؟" "Do you drink coffee?" "Kahve içer misin?" @("هل","تشرب","قهوة") 1
AddSentence "A1" "food-drink" "هذا طعام لذيذ" "This is delicious" "Bu lezzetli yemek" @("هذا","طعام","لذيذ") 1
AddSentence "A1" "food-drink" "أين المطعم؟" "Where's the restaurant?" "Restoran nerede?" @("أين","المطعم") 1
AddSentence "A1" "food-drink" "الماء بارد" "The water is cold" "Su soğuk" @("الماء","بارد") 1
AddSentence "A1" "food-drink" "أنا جائع" "I'm hungry" "Açım" @("أنا","جائع") 1
AddSentence "A1" "food-drink" "أنا عطشان" "I'm thirsty" "Susadım" @("أنا","عطشان") 1
AddSentence "A1" "shopping" "كم الثمن؟" "How much is it?" "Fiyatı ne kadar?" @("كم","الثمن") 1
AddSentence "A1" "shopping" "هذا غال جداً" "This is very expensive" "Bu çok pahalı" @("هذا","غال","جداً") 1
AddSentence "A1" "weather" "الطقس بارد" "The weather is cold" "Hava soğuk" @("الطقس","بارد") 1
AddSentence "A1" "work" "أنا أعمل في شركة" "I work in a company" "Bir şirkette çalışıyorum" @("أنا","أعمل","في","شركة") 2
AddSentence "A1" "work" "هذا مكتبي" "This is my office" "Burası ofisim" @("هذا","مكتبي") 1
AddSentence "A1" "relationships" "هذا صديقي" "This is my friend" "Bu arkadaşım" @("هذا","صديقي") 1
AddSentence "A1" "nature" "الكلب صغير" "The dog is small" "Köpek küçük" @("الكلب","صغير") 1
AddSentence "A1" "nature" "القطة جميلة" "The cat is beautiful" "Kedi güzel" @("القطة","جميلة") 1
AddSentence "A1" "religion" "الحمد لله" "Praise be to God" "Elhamdülillah" @("الحمد","لله") 1
AddSentence "A1" "religion" "بسم الله" "In the name of God" "Bismillah" @("بسم","الله") 1
AddSentence "A1" "religion" "الله أكبر" "God is Greatest" "Allahu Ekber" @("الله","أكبر") 1
AddSentence "A1" "education" "اقرأ الكتاب" "Read the book" "Kitabı oku" @("اقرأ","الكتاب") 1
AddSentence "A1" "education" "اكتب الدرس" "Write the lesson" "Dersi yaz" @("اكتب","الدرس") 1
AddSentence "A1" "education" "هذا درسي الأول" "This is my first lesson" "Bu ilk dersim" @("هذا","درسي","الأول") 2
AddSentence "A1" "daily-life" "هل هذا ممكن؟" "Is this possible?" "Bu mümkün mü?" @("هل","هذا","ممكن") 1
AddSentence "A1" "travel" "أنا من تركيا" "I'm from Turkey" "Türkiye'denim" @("أنا","من","تركيا") 1
AddSentence "A1" "travel" "أنا من أمريكا" "I'm from America" "Amerika'danım" @("أنا","من","أمريكا") 1
AddSentence "A1" "travel" "من أين أنت؟" "Where are you from?" "Nerelisin?" @("من","أين","أنت") 1
AddSentence "A1" "health" "أنا مريض" "I'm sick" "Hastayım" @("أنا","مريض") 1
AddSentence "A1" "greetings" "من فضلك" "Please" "Lütfen" @("من","فضلك") 1
AddSentence "A1" "greetings" "عفواً" "Excuse me / You're welcome" "Affedersiniz / Bir şey değil" @("عفواً") 1
AddSentence "A1" "daily-life" "صباحاً أذهب إلى العمل" "In the morning I go to work" "Sabah işe giderim" @("صباحاً","أذهب","إلى","العمل") 2
AddSentence "A1" "education" "المعلم في الفصل" "The teacher is in the class" "Öğretmen sınıfta" @("المعلم","في","الفصل") 2
AddSentence "A1" "family" "أمي في البيت" "My mother is at home" "Annem evde" @("أمي","في","البيت") 1
AddSentence "A1" "family" "أبي في العمل" "My father is at work" "Babam işte" @("أبي","في","العمل") 1
AddSentence "A1" "daily-life" "البيت كبير" "The house is big" "Ev büyük" @("البيت","كبير") 1
AddSentence "A1" "daily-life" "الغرفة واسعة" "The room is spacious" "Oda geniş" @("الغرفة","واسعة") 2
AddSentence "A1" "food-drink" "هذا الخبز طازج" "This bread is fresh" "Bu ekmek taze" @("هذا","الخبز","طازج") 2
AddSentence "A1" "family" "عندي أخ وأخت" "I have a brother and sister" "Bir erkek bir kız kardeşim var" @("عندي","أخ","وأخت") 2
AddSentence "A1" "travel" "أنا أعيش في إسطنبول" "I live in Istanbul" "İstanbul'da yaşıyorum" @("أنا","أعيش","في","إسطنبول") 2
AddSentence "A1" "education" "هذا القلم أزرق" "This pen is blue" "Bu kalem mavi" @("هذا","القلم","أزرق") 2

# A2
AddSentence "A2" "daily-life" "ذهبت إلى السوق اليوم" "I went to the market today" "Bugün pazara gittim" @("ذهبت","إلى","السوق","اليوم") 2
AddSentence "A2" "shopping" "اشتريت كتاباً جديداً" "I bought a new book" "Yeni bir kitap aldım" @("اشتريت","كتاباً","جديداً") 2
AddSentence "A2" "travel" "سافرت إلى أنقرة الأسبوع الماضي" "I traveled to Ankara last week" "Geçen hafta Ankara'ya gittim" @("سافرت","إلى","أنقرة","الأسبوع","الماضي") 3
AddSentence "A2" "health" "أشعر بصداع" "I have a headache" "Başım ağrıyor" @("أشعر","بصداع") 2
AddSentence "A2" "health" "عندي موعد مع الطبيب" "I have a doctor's appointment" "Doktor randevum var" @("عندي","موعد","مع","الطبيب") 3
AddSentence "A2" "travel" "هل زرت إسطنبول من قبل؟" "Have you visited Istanbul?" "İstanbul'u ziyaret ettin mi?" @("هل","زرت","إسطنبول","من","قبل") 3
AddSentence "A2" "food-drink" "المطعم كان مزدحماً جداً" "The restaurant was crowded" "Restoran çok kalabalıktı" @("المطعم","كان","مزدحماً","جداً") 3
AddSentence "A2" "daily-life" "لا يوجد ماء في الثلاجة" "There's no water in the fridge" "Buzdolabında su yok" @("لا","يوجد","ماء","في","الثلاجة") 3
AddSentence "A2" "health" "يجب أن تذهب إلى الطبيب" "You must go to the doctor" "Doktora gitmelisin" @("يجب","أن","تذهب","إلى","الطبيب") 3
AddSentence "A2" "education" "أريد أن أتعلم اللغة العربية" "I want to learn Arabic" "Arapça öğrenmek istiyorum" @("أريد","أن","أتعلم","اللغة","العربية") 3
AddSentence "A2" "family" "سأزور أهلي في نهاية الأسبوع" "I'll visit my family on weekend" "Hafta sonu ailemi ziyaret edeceğim" @("سأزور","أهلي","في","نهاية","الأسبوع") 3
AddSentence "A2" "travel" "كان الفندق رائعاً" "The hotel was wonderful" "Otel harikaydı" @("كان","الفندق","رائعاً") 3
AddSentence "A2" "hobbies" "ماذا تعمل في وقت الفراغ؟" "What do you do in free time?" "Boş zamanında ne yaparsın?" @("ماذا","تعمل","في","وقت","الفراغ") 3
AddSentence "A2" "hobbies" "أنا أحب القراءة" "I love reading" "Okumayı seviyorum" @("أنا","أحب","القراءة") 2
AddSentence "A2" "hobbies" "ألعب كرة القدم كل أسبوع" "I play football every week" "Her hafta futbol oynarım" @("ألعب","كرة","القدم","كل","أسبوع") 3
AddSentence "A2" "travel" "المدينة جميلة جداً في الليل" "The city is beautiful at night" "Şehir gece çok güzel" @("المدينة","جميلة","جداً","في","الليل") 3
AddSentence "A2" "hobbies" "سأذهب إلى النادي الرياضي" "I'll go to the gym" "Spor salonuna gideceğim" @("سأذهب","إلى","النادي","الرياضي") 3
AddSentence "A2" "work" "أنا أعمل في مستشفى" "I work in a hospital" "Hastanede çalışıyorum" @("أنا","أعمل","في","مستشفى") 3
AddSentence "A2" "daily-life" "ساتصل بك لاحقاً" "I'll call you later" "Seni sonra arayacağım" @("ساتصل","بك","لاحقاً") 2
AddSentence "A2" "relationships" "هذه هدية لك" "This is a gift for you" "Bu senin için hediye" @("هذه","هدية","لك") 2
AddSentence "A2" "daily-life" "كم ساعة تنام في الليل؟" "How many hours do you sleep?" "Gece kaç saat uyuyorsun?" @("كم","ساعة","تنام","في","الليل") 3
AddSentence "A2" "education" "ماذا قال المدرس؟" "What did the teacher say?" "Öğretmen ne dedi?" @("ماذا","قال","المدرس") 2
AddSentence "A2" "family" "أين الأطفال؟" "Where are the children?" "Çocuklar nerede?" @("أين","الأطفال") 1
AddSentence "A2" "greetings" "سعدت بلقائك" "Nice to meet you" "Tanıştığımıza memnun oldum" @("سعدت","بلقائك") 2
AddSentence "A2" "daily-life" "هل تحتاج إلى شيء؟" "Do you need anything?" "Bir şeye ihtiyacın var mı?" @("هل","تحتاج","إلى","شيء") 2
AddSentence "A2" "travel" "أين المحطة؟" "Where is the station?" "İstasyon nerede?" @("أين","المحطة") 1
AddSentence "A2" "daily-life" "هل يمكنك أن تساعدني؟" "Can you help me?" "Bana yardım eder misin?" @("هل","يمكنك","أن","تساعدني") 3
AddSentence "A2" "family" "ولدت في مدينة صغيرة" "I was born in a small city" "Küçük bir şehirde doğdum" @("ولدت","في","مدينة","صغيرة") 3
AddSentence "A2" "food-drink" "شربنا الشاي في الحديقة" "We drank tea in the garden" "Bahçede çay içtik" @("شربنا","الشاي","في","الحديقة") 3
AddSentence "A2" "weather" "نزل المطر بغزارة اليوم" "It rained heavily today" "Bugün şiddetli yağmur yağdı" @("نزل","المطر","بغزارة","اليوم") 3
AddSentence "A2" "travel" "سافرنا بالطائرة إلى دبي" "We flew to Dubai" "Dubai'ye uçakla gittik" @("سافرنا","بالطائرة","إلى","دبي") 3
AddSentence "A2" "shopping" "هل يمكننا الدفع بالبطاقة؟" "Can we pay by card?" "Kartla ödeyebilir miyiz?" @("هل","يمكننا","الدفع","بالبطاقة") 3
AddSentence "A2" "travel" "الحافلة أرخص من القطار" "The bus is cheaper than the train" "Otobüs trenden daha ucuz" @("الحافلة","أرخص","من","القطار") 3
AddSentence "A2" "work" "العمل اليوم كان مرهقاً" "Today's work was exhausting" "Bugünkü iş yorucuydu" @("العمل","اليوم","كان","مرهقاً") 3
AddSentence "A2" "daily-life" "أين المفتاح؟" "Where is the key?" "Anahtar nerede?" @("أين","المفتاح") 1
AddSentence "A2" "education" "درست اللغة العربية في الجامعة" "I studied Arabic at university" "Üniversitede Arapça okudum" @("درست","اللغة","العربية","في","الجامعة") 3
AddSentence "A2" "hobbies" "في الصيف نذهب إلى البحر" "In summer we go to the beach" "Yazın denize gideriz" @("في","الصيف","نذهب","إلى","البحر") 2
AddSentence "A2" "daily-life" "هل عندك خطة للغد؟" "Do you have plans for tomorrow?" "Yarın için planın var mı?" @("هل","عندك","خطة","للغد") 3
AddSentence "A2" "food-drink" "الغداء جاهز" "Lunch is ready" "Öğle yemeği hazır" @("الغداء","جاهز") 2
AddSentence "A2" "daily-life" "ماذا فعلت البارحة؟" "What did you do last night?" "Dün gece ne yaptın?" @("ماذا","فعلت","البارحة") 2
AddSentence "A2" "travel" "أنا أحب السفر جداً" "I love traveling" "Seyahat etmeyi çok seviyorum" @("أنا","أحب","السفر","جداً") 2
AddSentence "A2" "shopping" "الدفع نقداً فقط" "Cash only" "Sadece nakit" @("الدفع","نقداً","فقط") 2
AddSentence "A2" "travel" "أين أجد سيارة أجرة؟" "Where can I find a taxi?" "Taksiyi nerede bulurum?" @("أين","أجد","سيارة","أجرة") 2
AddSentence "A2" "weather" "الجو اليوم غائم" "Today is cloudy" "Bugün hava bulutlu" @("الجو","اليوم","غائم") 2
AddSentence "A2" "food-drink" "هل تفضل القهوة أم الشاي؟" "Do you prefer coffee or tea?" "Kahveyi mi çayı mı tercih edersin?" @("هل","تفضل","القهوة","أم","الشاي") 3
AddSentence "A2" "culture" "القراءة توسع العقل" "Reading expands the mind" "Okumak zihni açar" @("القراءة","توسع","العقل") 3
AddSentence "A2" "religion" "صلاة الصبح ركعتان" "Morning prayer is two rak'ahs" "Sabah namazı iki rekâttır" @("صلاة","الصبح","ركعتان") 3
AddSentence "A2" "health" "هل تشعر بالتعب؟" "Do you feel tired?" "Yorgun musun?" @("هل","تشعر","بالتعب") 2
AddSentence "A2" "nature" "هذه زهرة جميلة" "This is a beautiful flower" "Bu güzel bir çiçek" @("هذه","زهرة","جميلة") 2
AddSentence "A2" "education" "استيقظت مبكراً اليوم" "I woke up early today" "Bugün erken kalktım" @("استيقظت","مبكراً","اليوم") 2
AddSentence "A2" "daily-life" "نحن نسكن في بيت قريب من البحر" "We live near the sea" "Denize yakın bir evde oturuyoruz" @("نحن","نسكن","في","بيت","قريب","من","البحر") 3
AddSentence "A2" "relationships" "أنا مشتاق لأهلي" "I miss my family" "Ailemi özledim" @("أنا","مشتاق","لأهلي") 2
AddSentence "A2" "work" "أنا أشتغل مدرساً" "I work as a teacher" "Öğretmen olarak çalışıyorum" @("أنا","أشتغل","مدرساً") 3
AddSentence "A2" "hobbies" "شاهدت مباراة كرة القدم" "I watched the football match" "Futbol maçını izledim" @("شاهدت","مباراة","كرة","القدم") 3

# B1
AddSentence "B1" "education" "أعتقد أن العربية لغة جميلة" "I think Arabic is beautiful" "Arapça güzel bir dil bence" @("أعتقد","أن","العربية","لغة","جميلة") 3
AddSentence "B1" "daily-life" "لو كان عندي مال كاف لسافرت حول العالم" "If I had money I'd travel the world" "Param olsa dünyayı gezerdim" @("لو","كان","عندي","مال","كاف","سافرت","حول","العالم") 4
AddSentence "B1" "relationships" "لو كنت مكانك لفعلت شيئاً مختلفاً" "If I were you I'd do differently" "Yerinde olsam farklı yapardım" @("لو","كنت","مكانك","لفعلت","شيئاً","مختلفاً") 4
AddSentence "B1" "daily-life" "أظن أن الحياة أجمل مما نتوقع" "Life is more beautiful than we think" "Hayat beklediğimizden güzel" @("أظن","أن","الحياة","أجمل","مما","نتوقع") 4
AddSentence "B1" "work" "لا يمكنني القدوم إلى العمل غداً لاني مريض" "I can't come to work tomorrow I'm sick" "Yarın işe gelemem hastayım" @("لا","يمكنني","القدوم","إلى","العمل","غداً","لاني","مريض") 4
AddSentence "B1" "culture" "من جد وجد ومن زرع حصد" "Who strives finds, who sows reaps" "Çalışan bulur eken biçer" @("من","جد","وجد","ومن","زرع","حصد") 4
AddSentence "B1" "culture" "ليس كل ما يلمع ذهباً" "Not all that glitters is gold" "Her parlayan altın değildir" @("ليس","كل","ما","يلمع","ذهباً") 3
AddSentence "B1" "education" "يمكنني أن أتحدث العربية بطلاقة" "I can speak Arabic fluently" "Arapçayı akıcı konuşabiliyorum" @("يمكنني","أن","أتحدث","العربية","بطلاقة") 4
AddSentence "B1" "work" "سألتحق بدورة تدريبية لتطوير مهاراتي" "I'll join a training course" "Kursa katılıp becerilerimi geliştireceğim" @("سألتحق","بدورة","تدريبية","لتطوير","مهاراتي") 4
AddSentence "B1" "nature" "الحفاظ على البيئة مسؤولية جماعية" "Protecting environment is collective duty" "Çevreyi korumak ortak sorumluluk" @("الحفاظ","على","البيئة","مسؤولية","جماعية") 4
AddSentence "B1" "technology" "تشكل التكنولوجيا جزءاً هاماً من حياتنا" "Technology is important in our lives" "Teknoloji hayatımızın önemli parçası" @("تشكل","التكنولوجيا","جزءاً","هاماً","من","حياتنا") 4
AddSentence "B1" "relationships" "يجب علينا أن نحترم وقت الآخرين" "We must respect others' time" "Başkalarının zamanına saygı göstermeliyiz" @("يجب","علينا","أن","نحترم","وقت","الآخرين") 4
AddSentence "B1" "work" "تمكنت من إكمال العمل في الوقت المحدد" "I completed the work on time" "İşi zamanında tamamladım" @("تمكنت","من","إكمال","العمل","في","الوقت","المحدد") 4
AddSentence "B1" "news" "هل سمعت بالخبر اليوم؟" "Did you hear the news?" "Bugün haberleri duydun mu?" @("هل","سمعت","بالخبر","اليوم") 3
AddSentence "B1" "culture" "الوقت كالسيف إن لم تقطعه قطعك" "Time is like a sword" "Zaman kılıç gibidir" @("الوقت","كالسيف","إن","لم","تقطعه","قطعك") 4
AddSentence "B1" "education" "لن تتقدم الأمة إلا بالعلم" "The nation only progresses through knowledge" "Toplum ancak ilimle ilerler" @("لن","تتقدم","الأمة","إلا","بالعلم") 4
AddSentence "B1" "education" "أصبح التعليم عن بعد أكثر انتشاراً" "Distance learning became widespread" "Uzaktan eğitim yaygınlaştı" @("أصبح","التعليم","عن","بعد","أكثر","انتشاراً") 4
AddSentence "B1" "work" "ما رأيك في المقترح الجديد؟" "What do you think of the new proposal?" "Yeni teklif hakkında ne düşünüyorsun?" @("ما","رأيك","في","المقترح","الجديد") 4
AddSentence "B1" "health" "العافية أهم من الثروة" "Health is more important than wealth" "Sağlık zenginlikten önemli" @("العافية","أهم","من","الثروة") 3
AddSentence "B1" "relationships" "الحب ليس كلمة بل فعل" "Love is not a word but action" "Sevgi söz değil eylemdir" @("الحب","ليس","كلمة","بل","فعل") 3
AddSentence "B1" "family" "الأم مثال الحنان والعطاء" "Mother is an example of love and giving" "Anne şefkat ve fedakarlık örneği" @("الأم","مثال","الحنان","والعطاء") 4
AddSentence "B1" "food-drink" "هل لك أن توصيني بمطعم جيد؟" "Can you recommend a good restaurant?" "İyi restoran tavsiye eder misin?" @("هل","لك","أن","توصيني","بمطعم","جيد") 4
AddSentence "B1" "education" "كلما قرأت أكثر كلما تعلمت أكثر" "The more you read the more you learn" "Ne kadar okursan o kadar öğrenirsin" @("كلما","قرأت","أكثر","كلما","تعلمت","أكثر") 4
AddSentence "B1" "daily-life" "عليك بالصبر حتى تصل إلى هدفك" "Be patient until you reach your goal" "Hedefine ulaşana kadar sabret" @("عليك","بالصبر","حتى","تصل","إلى","هدفك") 4
AddSentence "B1" "education" "سعيت جاهداً لتحقيق أهدافي" "I strove hard to achieve my goals" "Hedeflerim için çok çalıştım" @("سعيت","جاهداً","لتحقيق","أهدافي") 4
AddSentence "B1" "travel" "لقد قضيت عطلة رائعة في المغرب" "I had a great holiday in Morocco" "Fas'ta harika tatil geçirdim" @("لقد","قضيت","عطلة","رائعة","في","المغرب") 4
AddSentence "B1" "education" "استفدت كثيراً من هذه الدورة" "I benefited a lot from this course" "Bu kurstan çok faydalandım" @("استفدت","كثيراً","من","هذه","الدورة") 3
AddSentence "B1" "travel" "أود لو أزور مصر يوماً ما" "I'd love to visit Egypt one day" "Bir gün Mısır'ı ziyaret etmek isterim" @("أود","لو","أزور","مصر","يوماً","ما") 4
AddSentence "B1" "news" "يشهد العالم العربي نمواً اقتصادياً" "Arab world is experiencing economic growth" "Arap dünyası ekonomik büyüyor" @("يشهد","العالم","العربي","نمواً","اقتصادياً") 4
AddSentence "B1" "education" "من الضروري أن نتعلم من أخطائنا" "We must learn from our mistakes" "Hatalarımızdan ders almalıyız" @("من","الضروري","أن","نتعلم","من","أخطائنا") 4
AddSentence "B1" "relationships" "الأصدقاء وفيون في المواقف الصعبة" "Friends are loyal in hard times" "Arkadaşlar zor zamanda sadıktır" @("الأصدقاء","وفيون","في","المواقف","الصعبة") 4
AddSentence "B1" "travel" "لو سافرنا بالقطار لوفرنا وقتاً" "If we went by train we'd save time" "Trenle gitsek zaman kazanırdık" @("لو","سافرنا","بالقطار","وفرنا","وقتاً") 4
AddSentence "B1" "education" "عزمت على إتقان العربية في ستة أشهر" "I decided to master Arabic in 6 months" "Altı ayda Arapçada ustalaşmaya karar verdim" @("عزمت","على","إتقان","العربية","في","ستة","أشهر") 4
AddSentence "B1" "daily-life" "لا نستطيع تغيير الماضي لكن نبني المستقبل" "We can't change the past but build the future" "Geçmişi değiştiremeyiz ama geleceği inşa ederiz" @("لا","نستطيع","تغيير","الماضي","لكن","نبني","المستقبل") 4
AddSentence "B1" "family" "يساعدني والداي في دراستي دائماً" "My parents always help me study" "Ailem derslerimde hep yardım eder" @("يساعدني","والداي","في","دراستي","دائماً") 4
AddSentence "B1" "hobbies" "أقوم بتمارين الرياضة كل صباح" "I exercise every morning" "Her sabah egzersiz yaparım" @("أقوم","بتمارين","الرياضة","كل","صباح") 4
AddSentence "B1" "business" "تم الاتفاق بين الشركتين" "An agreement was reached between the companies" "Şirketler arasında anlaşma sağlandı" @("تم","الاتفاق","بين","الشركتين") 4

# B2
AddSentence "B2" "travel" "إذا كان الغد يوم عطلة لسافرنا" "If tomorrow were a holiday we'd travel" "Yarın tatil olsa seyahat ederdik" @("إذا","كان","الغد","يوم","عطلة","لسافرنا") 4
AddSentence "B2" "culture" "تختلف العادات والتقاليد من دولة إلى أخرى" "Customs vary from country to country" "Gelenekler ülkeden ülkeye değişir" @("تختلف","العادات","والتقاليد","من","دولة","إلى","أخرى") 5
AddSentence "B2" "work" "ينبغي أن يتحلى الموظف بالصبر والأمانة" "An employee must be patient and honest" "Çalışan sabırlı ve dürüst olmalı" @("ينبغي","أن","يتحلى","الموظف","بالصبر","والأمانة") 5
AddSentence "B2" "education" "ليس من السهل أن تتعلم العربية بدون مدرس" "It's not easy learning Arabic without a teacher" "Öğretmensiz Arapça zor" @("ليس","من","السهل","أن","تتعلم","العربية","بدون","مدرس") 4
AddSentence "B2" "travel" "قد يكون السفر إلى الخارج فرصة للتعلم" "Traveling abroad can be a learning opportunity" "Yurt dışı öğrenme fırsatı olabilir" @("قد","يكون","السفر","إلى","الخارج","فرصة","للتعلم") 5
AddSentence "B2" "nature" "حاول الباحثون إيجاد حل للمشكلة البيئية" "Researchers tried to solve the environmental problem" "Araştırmacılar çevre sorununa çözüm aradı" @("حاول","الباحثون","إيجاد","حل","للمشكلة","البيئية") 5
AddSentence "B2" "work" "استمر الاجتماع لمدة ساعتين" "The meeting lasted two hours" "Toplantı iki saat sürdü" @("استمر","الاجتماع","لمدة","ساعتين") 4
AddSentence "B2" "daily-life" "على الرغم من الصعوبات نجحنا في الامتحان" "Despite difficulties we passed the exam" "Zorluklara rağmen sınavı geçtik" @("على","الرغم","من","الصعوبات","نجحنا","في","الامتحان") 5
AddSentence "B2" "technology" "تساعدنا التكنولوجيا في تسهيل الحياة اليومية" "Technology helps simplify daily life" "Teknoloji günlük hayatı kolaylaştırır" @("تساعدنا","التكنولوجيا","في","تسهيل","الحياة","اليومية") 5
AddSentence "B2" "health" "ينصح الأطباء بممارسة الرياضة يومياً" "Doctors recommend daily exercise" "Doktorlar günlük spor öneriyor" @("ينصح","الأطباء","بممارسة","الرياضة","يومياً") 4
AddSentence "B2" "news" "صَرَّحَ الرَّئِيسُ بِأَنَّ الِاقْتِصَادَ فِي تَحَسُّن" "The president stated economy is improving" "Başkan ekonominin iyileştiğini açıkladı" @("صرح","الرئيس","بأن","الاقتصاد","في","تحسن") 5
AddSentence "B2" "travel" "يمكنك الحصول على تأشيرة بسهولة إلى هذه الدولة" "You can easily get a visa to this country" "Bu ülkeye kolayca vize alabilirsin" @("يمكنك","الحصول","على","تأشيرة","بسهولة","إلى","هذه","الدولة") 5
AddSentence "B2" "relationships" "تزداد الصداقة قوة مع مرور الأيام" "Friendship grows stronger with time" "Arkadaşlık gün geçtikçe güçlenir" @("تزداد","الصداقة","قوة","مع","مرور","الأيام") 4
AddSentence "B2" "work" "بذل الموظفون جهوداً كبيرة لإنجاح المشروع" "Employees made great efforts for the project" "Çalışanlar proje için büyük çaba harcadı" @("بذل","الموظفون","جهوداً","كبيرة","لإنجاح","المشروع") 5
AddSentence "B2" "food-drink" "الطبخ في البيت أصح من الطعام الجاهز" "Home cooking is healthier than fast food" "Ev yemeği hazır yiyecekten sağlıklı" @("الطبخ","في","البيت","أصح","من","الطعام","الجاهز") 4
AddSentence "B2" "work" "القيادة الحكيمة تؤدي إلى نجاح المؤسسة" "Wise leadership leads to success" "Bilge liderlik başarı getirir" @("القيادة","الحكيمة","تؤدي","إلى","نجاح","المؤسسة") 5
AddSentence "B2" "technology" "أصبحت الهواتف الذكية أداة لا غنى عنها" "Smartphones became indispensable" "Akıllı telefonlar vazgeçilmez oldu" @("أصبحت","الهواتف","الذكية","أداة","لا","غنى","عنها") 5
AddSentence "B2" "daily-life" "بدأنا المشروع منذ شهر ولا نزال في البداية" "We started the project a month ago" "Projeye ay önce başladık daha başındayız" @("بدأنا","المشروع","منذ","شهر","ولا","نزال","في","البداية") 5
AddSentence "B2" "culture" "تشتهر هذه المدينة بأسواقها التقليدية" "This city is famous for its traditional markets" "Bu şehir geleneksel çarşılarıyla ünlü" @("تشتهر","هذه","المدينة","بأسواقها","التقليدية") 5
AddSentence "B2" "education" "الطالب المجتهد يحقق نتائج أفضل" "The hardworking student achieves better results" "Çalışkan öğrenci daha iyi sonuç alır" @("الطالب","المجتهد","يحقق","نتائج","أفضل") 4

# C1
AddSentence "C1" "culture" "للغة العربية أثر بالغ في ثقافة العالم" "Arabic has a profound impact on world culture" "Arapçanın dünya kültüründe büyük etkisi vardır" @("للغة","العربية","أثر","بالغ","في","ثقافة","العالم") 6
AddSentence "C1" "literature" "تمتاز الشعر العربي ببلاغته وجمال أسلوبه" "Arabic poetry is known for its eloquence" "Arap şiiri belagatıyla ünlüdür" @("تمتاز","الشعر","العربي","ببلاغته","وجمال","أسلوبه") 6
AddSentence "C1" "work" "لا شك أن الاستثمار في التعليم هو أفضل استثمار" "Investing in education is the best investment" "Eğitime yatırım en iyi yatırımdır" @("لا","شك","أن","الاستثمار","في","التعليم","هو","أفضل","استثمار") 6
AddSentence "C1" "technology" "للذكاء الاصطناعي تطبيقات واسعة في مختلف المجالات" "AI has wide applications in many fields" "Yapay zekanın birçok alanda uygulamaları var" @("للذكاء","الاصطناعي","تطبيقات","واسعة","في","مختلف","المجالات") 6
AddSentence "C1" "health" "يعتبر الطب الوقائي أفضل وسيلة للحفاظ على الصحة" "Preventive medicine is the best way to stay healthy" "Koruyucu tıp sağlık için en iyi yoldur" @("يعتبر","الطب","الوقائي","أفضل","وسيلة","للحفاظ","على","الصحة") 6
AddSentence "C1" "culture" "تتجلى روعة الحضارة العربية في إسهاماتها العلمية" "Arab civilization's splendor is in its scientific contributions" "Arap medeniyetinin ihtişamı bilimsel katkılarında" @("تتجلى","روعة","الحضارة","العربية","في","إسهاماتها","العلمية") 6
AddSentence "C1" "work" "تتطلب العولمة مواكبة التطورات الاقتصادية" "Globalization requires keeping up with economic changes" "Küreselleşme ekonomik gelişmeleri takip gerektirir" @("تتطلب","العولمة","مواكبة","التطورات","الاقتصادية") 6
AddSentence "C1" "society" "يلعب المجتمع المدني دوراً محورياً في التنمية" "Civil society plays a key role in development" "Sivil toplum kalkınmada kilit rol oynar" @("يلعب","المجتمع","المدني","دوراً","محورياً","في","التنمية") 6
AddSentence "C1" "culture" "تحظى الأعياد بأهمية خاصة في الثقافة العربية" "Holidays have special importance in Arab culture" "Bayramlar Arap kültüründe özel öneme sahiptir" @("تحظى","الأعياد","بأهمية","خاصة","في","الثقافة","العربية") 6
AddSentence "C1" "society" "تتفاوت الفرص الاقتصادية بين أفراد المجتمع" "Economic opportunities vary among people" "Ekonomik fırsatlar kişiden kişiye değişir" @("تتفاوت","الفرص","الاقتصادية","بين","أفراد","المجتمع") 6

# C2
AddSentence "C2" "literature" "يعد أدب الطفل رافداً أساسياً في تكوين شخصية الإنسان" "Children's literature is key in forming personality" "Çocuk edebiyatı kişilik oluşumunda temeldir" @("يعد","أدب","الطفل","رافداً","أساسياً","في","تكوين","شخصية","الإنسان") 7
AddSentence "C2" "culture" "يمتاز الخط العربي بمرونته وجمال تكوينه" "Arabic calligraphy is flexible and beautifully composed" "Arap hattı esneklik ve güzelliğiyle öne çıkar" @("يمتاز","الخط","العربي","بمرونته","وجمال","تكوينه") 7
AddSentence "C2" "culture" "لا يزال التراث العربي مصدر فخر واعتزاز للأمة" "Arab heritage remains a source of pride" "Arap mirası ümmet için gurur kaynağı" @("لا","يزال","التراث","العربي","مصدر","فخر","واعتزاز","للأمة") 7
AddSentence "C2" "society" "تتراوح النظريات الاجتماعية بين الفردانية والجمعية" "Social theories range between individualism and collectivism" "Sosyal teoriler bireycilik ve kolektivizm arasında" @("تتراوح","النظريات","الاجتماعية","بين","الفردانية","والجمعية") 7
AddSentence "C2" "technology" "عصر الذكاء الاصطناعي يعيد صياغة مفاهيمنا عن العمل" "The AI age is reshaping our concepts of work" "Yapay zeka çağı iş kavramlarımızı yeniden şekillendiriyor" @("عصر","الذكاء","الاصطناعي","يعيد","صياغة","مفاهيمنا","عن","العمل") 7
AddSentence "C2" "literature" "نال الأديب جائزة نوبل لأعماله الروائية المبتكرة" "The writer won the Nobel Prize for his novels" "Yazar yenilikçi romanlarıyla Nobel kazandı" @("نال","الأديب","جائزة","نوبل","لأعماله","الروائية","المبتكرة") 7
AddSentence "C2" "society" "يتطلب العيش في مجتمع تعددي قبول الاختلاف" "Living in a pluralistic society requires accepting difference" "Çoğulcu toplumda yaşamak farklılığı kabul gerektirir" @("يتطلب","العيش","في","مجتمع","تعددي","قبول","الاختلاف") 7
AddSentence "C2" "religion" "التسامح الديني أساس التعايش السلمي في المجتمعات المعاصرة" "Religious tolerance is the basis of peaceful coexistence" "Din hoşgörüsü barış içinde yaşamanın temelidir" @("التسامح","الديني","أساس","التعايش","السلمي","في","المجتمعات","المعاصرة") 7
AddSentence "C2" "economics" "يواجه الاقتصاد العالمي تحديات كبيرة في ظل التضخم" "The global economy faces major challenges amid inflation" "Küresel ekonomi enflasyon altında büyük zorluklarla karşı" @("يواجه","الاقتصاد","العالمي","تحديات","كبيرة","في","ظل","التضخم") 7
AddSentence "C2" "health" "تتعدد المقارِب العلاجية في الطب النفسي المعاصر" "Therapeutic approaches are diverse in modern psychiatry" "Çağdaş psikiyatride tedavi yaklaşımları çeşitlidir" @("تتعدد","المقارِب","العلاجية","في","الطب","النفسي","المعاصر") 7

# Build output
$output = @{
  version = "1.0"
  totalSentences = $sentences.Count
  levels = @("A1","A2","B1","B2","C1","C2")
  categories = @("greetings","family","daily-life","food-drink","travel","work","education","health","shopping","weather","hobbies","culture","religion","technology","nature","relationships","news","business","literature")
  sentences = $sentences
}

$json = $output | ConvertTo-Json -Depth 3 -Compress
$outPath = Join-Path (Split-Path $PSScriptRoot -Parent) "public\sentences-data.json"
$json | Set-Content -Path $outPath -Encoding UTF8
Write-Host "Generated $($sentences.Count) sentences → $outPath"
