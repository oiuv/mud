#include <ansi.h>
inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("李白", ({ "li bai", "li", "bai"}));
        set("long", @LONG
这便是唐朝第一大诗人李太白，只见他须垂三
尺，面如冠玉，双目炯炯有神。一手持青铜爵，
一手持长剑，正在独饮。
LONG);
        set("title", "唐朝大诗人");
        set("nickname", HIW "诗仙" NOR);
        set("gender", "男性");
        set("age", 37);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        set("per", 50);
        set("dugu-jiujian/nothing", 1);

        set("max_qi", 12000);
        set("max_jing", 8000);
        set("max_neili", 12000);
        set("neili", 12000);
        set("jiali", 250);
        set("combat_exp", 10000000);

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: exert_function, "freeze" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set_skill("dodge", 400);
        set_skill("parry", 400);
        set_skill("unarmed", 400);
        set_skill("unarmed", 400);
        set_skill("sword", 400);
        set_skill("dugu-jiujian", 400);
        set_skill("zuiquan-sanda", 400);
        set_skill("zuixian-bu", 400);
        set_skill("force", 400);
        set_skill("bingxin-jue", 400);
        set_skill("martial-cognize", 200);
        set_skill("literate", 500);
        set_skill("liquor", 500);
        set_skill("calligraphy", 500);

        map_skill("force", "bingxin-jue");
        map_skill("dodge", "zuixian-bu");
        map_skill("parry", "dugu-jiujian");
        map_skill("sword", "dugu-jiujian");
        map_skill("unarmed", "zuiquan-sanda");

        set("vendor_goods", ({
                "/clone/gift/jiuzhuan",
                //"/clone/gift/wangqing",
        }));

        setup();

        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
        set_temp("handing", carry_object("/d/sky/obj/shenjiu"));
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
