#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_COAGENT;

void create()
{
        set_name("李寻欢", ({ "li xunhuan", "li", "xunhuan"}));
        set("long", "    一个身着白衫的中年男子，俊俏的面庞\n" 
                    "毫无血色，似乎因酒色过度而苍白。他手中\n"
                    "握着一柄小刀，静静雕刻着一个木人。周围\n"
                    "发生的一切他仿佛都看不见。\n"); 
        set("nickname", HIR "小李探花" NOR);
        set("title", HIY "大宗师" NOR);
        set("gender", "男性");
        set("age", 34);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 6000);
        set("max_jing", 3000);
        set("max_neili", 6000);
        set("neili", 6000);
        set("jiali", 250);
        set("combat_exp", 5000000);

        set("chat_chance", 1);
        set("chat_msg",({
                CYN "李寻欢深深的叹了口气。\n" NOR,
                CYN "李寻欢静静地雕刻着手中的木偶。\n" NOR,
                CYN "李寻欢咳嗽了几声。\n" NOR,
                CYN "李寻欢：“咳…咳…”\n" NOR,
        }));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "throwing.fei" :),
                (: perform_action, "dodge.guiyuan" :),
                (: exert_function, "powerup" :),
        }) );
        /*
        set_skill("dodge", 350);
        set_skill("parry", 350);
        set_skill("unarmed", 350);
        set_skill("throwing", 350);
        set_skill("xiaoli-feidao", 350);
        set_skill("changquan", 350);
        set_skill("shexing-lifan", 350);
        set_skill("force", 350);
        set_skill("yijinjing", 350);
        set_skill("literate", 250);

        map_skill("force", "yijinjing");
        map_skill("dodge", "shexing-lifan");
        map_skill("parry", "changquan");
        map_skill("throwing", "xiaoli-feidao");
        map_skill("unarmed", "changquan");
        */

        setup();

        carry_object(__DIR__"obj/cloth1")->wear();
        carry_object(__DIR__"obj/renou");
        // carry_object("/kungfu/class/sky/obj/tianxiadan");
        // set_temp("handing", carry_object(__DIR__"obj/feidao"));
        add_money("gold", 2);
}

