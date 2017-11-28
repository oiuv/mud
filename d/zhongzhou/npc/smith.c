#include <ansi.h> 

inherit "/inherit/char/smith.c"; 

void create()
{
        set_name("Ìú½³", ({ "tiejiang", "smith" }));
        set("title", "¼×ëÐµêÀÏ°å");
        set("shen_type", 1);
        set("gender", "ÄÐÐÔ" );
        set("age", 33);
        set("long", "Ìú½³ÕýÓÃÌúÇ¯¼Ð×¡Ò»¿éºìÈÈµÄÌú¿é·Å½øÂ¯ÖÐ¡£\n");

        set("combat_exp", 400);
        set("attitude", "friendly");
        set("vendor_goods",({
                   "/d/jingzhou/obj/armor",
                   "/d/jingzhou/obj/beixin",
                   "/d/city/npc/obj/jinsijia",
        }));

        setup();

        carry_object("/clone/misc/cloth")->wear();
}
