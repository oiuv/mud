#include <ansi.h>

inherit NPC;
inherit F_BANKER;
int ask_weiwang();

void create()
{
        set_name("钱老本", ({"qian laoben", "qian", "laoben"}));
        set("title", HIR "天地会"HIG"青木堂"NOR"会众");
        set("gender", "男性");
        set("age", 34);

        set("str", 22);
        set("int", 24);
        set("dex", 18);
        set("con", 18);

        set("qi", 500); 
        set("max_qi", 500);
        set("jing", 100);
        set("max_jing", 100);
        set("shen", 0);

        set("combat_exp", 50000);
        set("shen_type", 1);
        set("attitude", "friendly");
        set("env/wimpy", 50);

        set("inquiry", ([
                "利息" :  "\n想要利息先入会！\n",
                "陈近南" :  "\n想见总舵主可没那么容易。\n",
                "天地会" :  "\n只要是英雄好汉，都可以入我天地会(join tiandihui)。\n",
                "加入" :  "\n只要入了我天地会，大家就可以一起反青复明。\n",
                "入会" :  "\n只要入了我天地会，大家就可以一起反青复明。\n",
                "威望" :  (: ask_weiwang :),
                "江湖威望" : (: ask_weiwang :),
       ]) );

        set_skill("unarmed", 50);
        set_skill("dodge", 50);
        set_temp("apply/attack", 100);
        set_temp("apply/defense", 100);
        set_temp("apply/damage", 40);

        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("gold", 1);
}

int ask_weiwang()
{
        command("tell "+this_player()->query("id")+" 你现在的江湖威望是 " +
                (string)(this_player()->query("weiwang")));
        say("\n钱老本说：如果你威望值很高，有些人见了你不但不会杀你，还会教你武功，送你宝贝。\n"
            "而且你还可以加入帮会，率领会众去攻打目标，就连去钱庄取钱也会有利息 。。。。。\n");
        say("钱老本又说：杀某些坏人或救某些好人可以提高江湖威望。\n");

        return 1;
}

#include "/kungfu/class/yunlong/tiandihui.h"

