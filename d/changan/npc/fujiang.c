//fujiang.c

inherit NPC;

string weapon_file, skill, special_skill;
string *first_name = ({ "ÕÔ","Ç®","Ëï","Àî","ÖÜ","Îâ","Ö£","Íõ","·®","³Â","×£",
                        "Îº","½¯","Éò","º«","Ñî", "Áõ","ÕÅ","ÁÖ","Öì","Å·Ñô",
                        "Ë¾Âí","Ä½Èİ","Öî¸ğ" });
string *name_words = ({ "Ë³","²ı","Õñ","·¢","²Æ","¿¡","Ñå","Á¼","Ö¾","ÖÒ",
        "Ğ¢","ĞÛ","Òæ","Ìí","½ğ","»Ô","³¤","Ê¢","Ê¤","½ø","°²","¸£","Í¬","Âú",
        "¸»","Íò","Áú","Â¡","Ïé","¶°","¹ú","ÒÚ","ÊÙ","Ë¼","ÁØ","À×","Åô","Æ½",
        "éø","¸¦","Î¬","Áä","ÇÅ","Ïª","Éù","¹È","É½","ÖÛ","ÑÒ","Èª","ÓÎ","Ñ·", });

void determine_data()
{
        switch(random(5))
        {
        case 0:
	        weapon_file="changjian";
	        skill="sword";
	        break;
        case 1:
                weapon_file="gangdao";
	        skill="blade";
	        break;
        case 2:
                weapon_file="gangzhang";
        	skill="staff";
        	break;
        case 3:
        	weapon_file="changbian";
        	skill="whip";
        	break;
        case 4:
        	weapon_file="axe";
        	skill="axe";
        	break;
        }
}

void create()
{
        string name;
        name = first_name[random(sizeof(first_name))];
        name += name_words[random(sizeof(name_words))];
        if (random(10) > 2) name += name_words[random(sizeof(name_words))];
	set_name(name, ({"fu jiang","fu","jiang", "general", "fujiang"}));
	set ("long", @LONG
Ò»ÃûÕ½¹¦ÀÛÀÛµÄ¸±½«¡£Èç½ñÌ«Æ½ÁË£¬±ãÁ·Á·±ø£¬ÒÔ·À±ß½®ÓĞ±ä¡£
LONG);
        determine_data();
        set("title", "¸±½«");
        set("gender", "ÄĞĞÔ");
        set("age", 20 + random(30));
        set("combat_exp", 300000 + random(100000));
        set_skill(skill, 120);
        set_skill("dodge", 120);
        set_skill("parry", 120);
        set_skill("unarmed", 120);
        set_skill("force", 120);
        set("max_qi", 700);
        set("max_jing", 700);
        set("max_neli", 800);
        set("force", 1000);
        set("jiali", 25);

        setup();
        carry_object(__DIR__"obj/" + weapon_file)->wield();
        carry_object(__DIR__"obj/zhanjia")->wear();
}
