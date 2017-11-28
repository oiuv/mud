//shiwei.c

#include <ansi.h>

inherit NPC;

string *first_name = ({ "ÕÔ","Ç®","Ëï","Àî","ÖÜ","Îâ","Ö£","Íõ","·®","³Â","×£","Îº","½¯","Éò",
                        "º«","Ñî", "Áõ","ÕÅ","ÁÖ","Öì","Å·Ñô","Ë¾Âí","Ä½ÈÝ","Öî¸ð" });
string *name_words = ({ "Ë³","²ý","Õñ","·¢","²Æ","¿¡","Ñå","Á¼","Ö¾","ÖÒ","Ð¢","ÐÛ","Òæ","Ìí",
                        "½ð","»Ô","³¤","Ê¢","Ê¤","½ø","°²","¸£","Í¬","Âú","¸»","Íò","Áú","Â¡",
                        "Ïé","¶°","¹ú","ÒÚ","ÊÙ","Ë¼","ÁØ","À×","Åô","Æ½","éø","¸¦","Î¬","Áä",
                        "ÇÅ","Ïª","Éù","¹È","É½","ÖÛ","ÑÒ","Èª","ÓÎ","Ñ·", });
        
void create()
{
        string name;
        name = first_name[random(sizeof(first_name))];
        name += name_words[random(sizeof(name_words))];
        if (random(10) > 2) name += name_words[random(sizeof(name_words))];
        set_name(name, ({"shi wei","shi","wei"}));
        set("long",
                "ÕâÊÇÎ»ÊØ»¤»Ê¹¬µÄ´øµ¶ÊÌÎÀ£¬Éí´©¾¢×°£¬ÊÖ³Ö¸Ö"
                "µ¶¡£ËûË«Ä¿¾«¹â¾¼¾¼£¬¾¯ÌèµØÑ²ÊÓ×ÅËÄÖÜµÄÇéÐÎ¡£\n");
        set("title", HIR"¶þÆ·´øµ¶ÊÌÎÀ"NOR);
        set("age", 25);
        set("combat_exp", 200000);
        set("attitude", "heroism");
        set("str", 25);
        set("max_qi", 1000);
	set("max_jing", 1000);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 30);
        set_skill("blade", 100);
        set_skill("unarmed", 100);
        set_skill("parry", 100);
        set_skill("dodge", 100);
	set_skill("force", 100);
        setup();

        carry_object(__DIR__"obj/blade")->wield();
        carry_object(__DIR__"obj/jinzhuang")->wear();
}
