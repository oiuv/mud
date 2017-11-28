// shipotian.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("石破天", ({"shi potian", "shi","potian"}));
        set("title", "长乐帮帮主");
        set("gender", "男性");
        set("age", 20);
        set("long", "他大约二十多岁，穿着一身破烂的衣服，却也挡不住他一身的英气。\n");

        set("attitude", "peaceful");

        set("str", 25);
        set("int", 35);
        set("con", 25);
        set("dex", 25);

        set("qi", 2000);
        set("max_qi", 2000);
        set("jing", 1000);
        set("max_jing", 1000);
        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 100);

        set("combat_exp", 1000000);
        set("score", 30000);

        set_skill("force", 100);
        set_skill("taixuan-gong", 150);
        set_skill("unarmed", 100);
        set_skill("dodge", 100);
        set_skill("parry", 100);
        set_skill("begging", 50);
        set_skill("checking", 50);

        map_skill("force", "taixuan-gong");
        map_skill("unarmed", "taixuan-gong");
        map_skill("dodge", "taixuan-gong");
        map_skill("parry", "taixuan-gong");

        set("chat_chance", 1);
        set("chat_msg", ({
                "石破天说道: 我来侠客岛这么多天了，也不知道阿绣和婆婆现在怎么样了。\n",
                "石破天说: 江湖威望很重要，威望高大有好处啊。\n",
                "石破天突然说道: 不行，我不放心阿绣，我要去看看她。\n",
                "石破天突然说道: 矣！我的体内怎么好象有一群蝌蚪在动呢。\n",
        }));
        set("inquiry", ([
                "石中玉" :  "他是我的兄弟，他现在在摩天崖。",
                "阿绣"   :  "呀！你见过她吗？她还好吧。",
        ]));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void destroy(object me, object ob)
{
        destruct(ob);
        return;
}
