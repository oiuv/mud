// kid.c

inherit NPC;

void create()
{
	set_name("°ÚÒÄĞ¡º¢",({ "kid" }) );
        set("gender", "ÄĞĞÔ" );
        set("age", 5);
        set("long", "Ò»¸öÓ×Ğ¡µÄ°ÚÒÄ¶ùÍ¯¡£\n");
        set("combat_exp", 50);
//        set("shen", 50);
	set("shen_type", 1);
	set("str", 11);
	set("dex", 11);
	set("con", 11);
	set("int", 11);
        set("attitude", "friendly");
        setup();
	carry_object("/clone/cloth/cloth")->wear();
}

