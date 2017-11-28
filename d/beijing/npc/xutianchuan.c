#include <ansi.h>
inherit NPC;
inherit F_UNIQUE;
int ask_weiwang();

void create()
{
        set_name("徐天川", ({ "xu tianchuan", "xu", "tianchuan" }));
        set("title", HIR "天地会"HIG"青木堂"NOR"护法");
        set("nickname", "八臂猿猴");
        set("gender", "男性");
        set("long", "\n他是青木堂数一数二的好手，手上功夫十分了得，尤其擅使一套猴拳。\n");
        set("age", 55);

        set("int", 30);
        
        set("qi", 500);
        set("max_qi", 500);
        set("jing", 500);
        set("max_jing", 500);
        set("shen_type", 1);

        set("combat_exp", 75000);
        set("attitude", "friendly");

        set_skill("force", 70);
        set_skill("dodge", 70);
        set_skill("parry", 90);
        set_skill("unarmed", 90);
        set_skill("hand", 100);
        set_skill("hunyuan-yiqi", 70);
        set_skill("shaolin-shenfa", 70);
        set_skill("houquan", 100);

        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/damage", 35);
        set("env/wimpy", 50);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("hand", "houquan");
        map_skill("unarmed", "houquan");
        map_skill("parry", "houquan");

        set("chat_chance", 3);
        set("chat_msg", ({
        "徐天川想了想，说：有人想要进出皇宫，我得想个法子才好啊。\n",
        "徐天川说道: 江湖威望很重要，威望值高大有好处啊。\n",
        "徐天川突然说：自此传得众兄弟，后来相认团圆时。\n",
        "徐天川突然说：初进洪门结义兄，对天明誓表真心。\n",
        }));

        set("inquiry", ([
                "陈近南" :  "\n想见总舵主可不容易啊。\n",
                "天地会" :  "\n只要是英雄好汉，都可以入我天地会(join tiandihui)。\n",
                "加入" :  "\n只要入了我天地会，大家就可以一起反青复明。\n",
                "入会" :  "\n只要入了我天地会，大家就可以一起反青复明。\n",
                "威望" :  (: ask_weiwang :),
                "江湖威望" : (: ask_weiwang :),
        ]) );

        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("gold", 1);
}

void init()
{
        ::init();
        add_action("do_join","join");
}

int ask_weiwang()
{
command("tell "+this_player()->query("id")+" 你现在的江湖威望是 " +(string)(this_player()->query("weiwang")));
say("\n徐天川说：如果你威望值很高，有些人见了你不但不会杀你，还会教你武功，送你宝贝。\n"
+"而且你还可以加入帮会，率领会众去攻打目标，就连去钱庄取钱也会有利息。\n");
say("徐天川又说：杀某些坏人或救某些好人可以提高江湖威望。\n");
return 1;
}

#include "/kungfu/class/yunlong/tiandihui.h";

