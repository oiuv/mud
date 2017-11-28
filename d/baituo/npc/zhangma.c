#include <ansi.h>
inherit NPC;

string inquiry_hua();

void create()
{
        set_name("张妈", ({ "zhang ma", "zhang", "ma" }));
        set("gender", "女性" );
        set("age", 50);
        set("long", "一个历经沧桑的老婆婆。\n");
        set("shen_type", 1);
        set("combat_exp", 500);
        set("str", 16);
        set("dex", 17);
        set("con", 17);
        set("int", 18);
        set("attitude", "friendly");
        set("chat_chance", 2);
        set("chat_msg", ({
                CYN "张妈念叨着：我苦命的金花哟，你现在在那里哟！\n" NOR,
                CYN "张妈暗暗抹了把眼泪。\n" NOR,
                CYN "张妈独自说道：我的金花呀，你怎能撇下我自个儿走了…\n" NOR
        }));

        set("inquiry", ([
                "金花" : (: inquiry_hua :),
        ]));

        set_temp("shoe", 1);
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

string inquiry_hua()
{
        object me = this_player();
        object obn;

        message_vision(CYN "张妈说道：这位" + RANK_D->query_respect(me) +
                       CYN "，金花是我的亲闺女，去年上山割草就一去不回，也"
                       "不知是死是活。\n" NOR, me );

        if(query_temp("shoe") == 0)
        {
                message_vision(CYN "张妈又道：今日我已经托人去寻找了，也不"
                               "知道怎么样了。\n" NOR, me);
                return "唉…也不知道现在她到底怎么样了。";
        }

        message_vision(CYN "张妈又说道：我这里有她落在草丛里的一只绣花鞋，"
                       "你要是找到她，就把鞋交给她，她会明白的。\n" HIC "张"
                       "妈从怀里""摸出一只绣花鞋交给你。\n" NOR, me);

        obn = new("/d/baituo/obj/shoe");
        obn->move(me, 1);
        set_temp("shoe", 0);
        return "请你无论如何要交到她手里。";
}

