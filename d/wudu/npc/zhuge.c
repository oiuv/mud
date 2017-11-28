inherit NPC;
mixed ask_me();
#include <ansi.h>

void create()
{
        set_name("诸葛不亮", ({ "zhuge buliang", "zhuge", "buliang" }) );
        set("gender", "男性" );
        set("age", 35);
        set("per", 30);
        set("long", "一位羽扇纶巾，仙风道骨的文士。\n");
        set("combat_exp", 200000);
        set("attitude", "friendly");
        set_skill("dodge", 80);
        set_skill("unarmed", 80);
        set_skill("parry", 80);
        set_skill("literate", 200);

        set("chat_chance", 2);
        set("chat_msg",({
                CYN "诸葛不亮叹道：本人上知天文，下晓地理，有经天纬地之才，奈何无人知晓。\n" NOR,
                CYN "诸葛不亮道：要过桃花峪，非得我诸葛家主传的诸葛行军散不可。\n" NOR,
        }));
        setup();

        add_money("silver", 20);
        set("inquiry", ([
                "name"       : "在下乃诸葛武候之第二十三代孙诸葛不亮是也。\n",
                "here"       : "此乃卧龙岗，乃我先祖读书之地也。\n",
                "诸葛亮"     : "阁下怎好直呼我先祖名讳？\n",
                "孔明先生"   : "此乃吾之先祖也，曾七擒孟获，平定了南疆。故而阁下若去\n"
                               "南疆，或许鄙人能助君一臂之力。",
                "瘴气"       : (: ask_me :),
                "桃花峪"     : (: ask_me :),
                "诸葛行军散" : (: ask_me :),
        ]));
        carry_object("/d/city/obj/cloth")->wear();
}

mixed ask_me()
{
        object ob;
        object me = this_player();

        if (present("xingjun san", me))
                return "嘿，这东西又卖不了钱，你要那么多干嘛？";

        command("say 苗疆桃花峪瘴气险恶异常，但若带有我先祖所创之诸葛行军散当可无恙。");
        command("say 这包药要随身携带，切末离身啊，切记，切记！");
        ob = new(__DIR__"obj/xingjunsan");
        ob->move(me, 1);
        return 1;
}
