#include <ansi.h>

inherit NPC;
int ask_weiwang();

void create()
{
        set_name("贾老六", ({ "jia laoliu", "jia" }));
        set("title", HIR "天地会"HIG"青木堂"NOR"会众");
        set("shen_type", 1);

        set("gender", "男性");
        set("age", 35);
        set("long",
                "\n他是天地会青木堂会众，当年在扬州之时，曾大骂盐枭，\n"+
                "骂他们不敢杀官造反，只会走私漏税，做没胆子的小生意，\n"+
                "结果得罪了青龙帮，遭人追杀，茅十八也因此和青龙帮结仇。\n");
        set("no_get_from", 1);

        set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_temp("apply/attack", 30);
        set_temp("apply/attack", 30);
        set_temp("apply/damage", 15);

        set("combat_exp", 50000);
        set("attitude", "friendly");
        set("chat_chance", 3);
        set("chat_msg", ({
        "贾老六忽然说：扬州盐贩子真可恶。\n",
        "贾老六说: 江湖威望很重要，威望值高大有好处啊。\n",
        "贾老六突然说道: 忠义堂前兄弟在，城中点将百万兵。\n",
        }));
        set("inquiry", ([
                "陈近南" :  "\n想见总舵主可不容易啊。\n",
                "天地会" :  "\n只要是英雄好汉，都可以入我天地会(join tiandihui)。\n",
                "加入" :  "\n只要入了我天地会，大家就可以一起反青复明。\n",
                "入会" :  "\n只要入了我天地会，可以向会中各位好手学武艺。\n",
                "威望" :  (: ask_weiwang :),
                "江湖威望" : (: ask_weiwang :),
       ]) );

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void die()
{
        message_vision("\n$N大叫道：兄弟们会替我报仇的，头一偏，死了。\n", this_object());
	::die();
}

int ask_weiwang()
{
	command("tell "+this_player()->query("id")+" 你现在的江湖威望是 " +(string)(this_player()->query("weiwang")));
say("\n贾老六说：如果你威望值很高，有些人见了你不但不会杀你，还会教你武功，送你宝贝。\n"
+"而且你还可以加入帮会，率领会众去攻打目标，就连去钱庄取钱也会有利息 。。。。。\n");
	say("贾老六又说：杀某些坏人或救某些好人可以提高江湖威望。\n");
	return 1;
}

