#include <ansi.h>
inherit NPC;

void create()
{
        set_name("白龟寿", ({ "bai guishou", "bai", "guishou"}));
        set("long", @LONG
他就是天鹰教玄武坛主白龟寿，看起来约莫五
十来岁，秃着头顶，一身结实的肌肉。
LONG);
        set("title", "天鹰教");
        set("nickname", WHT "玄武坛主" NOR);
        set("attitude", "heroism");
        set("age", 50);
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);
        
        set("max_qi", 3500);
        set("max_jing", 3500);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 150);
        set("combat_exp", 1500000);
        set("score", 10000);

        set_skill("force", 150);
        set_skill("riyue-xinfa", 150);
        set_skill("dodge", 150);
        set_skill("feiyan-zoubi", 150);
        set_skill("blade", 150);
        set_skill("danding-dao", 150);
        set_skill("parry", 150);
        set_skill("cuff", 150);
        set_skill("zhenyu-quan", 150);
        set_skill("claw", 150);
        set_skill("poyue-zhao", 150);
        set_skill("martial-cognize", 150);
        set_skill("literate", 100);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "riyue-xinfa");
        map_skill("blade", "danding-dao");
        map_skill("parry", "danding-dao");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        create_family("天鹰教", 2, "坛主");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
                (: exert_function, "recover" :),
                CYN "白龟寿喝道：无耻小贼，竟敢打屠龙刀的主意？\n" NOR,
                CYN "白龟寿骂道：奶奶的，居然连我们天鹰教都敢惹！\n" NOR,
                CYN "白龟寿骂道：天杀的，今天大爷就让你有来无回！\n" NOR,
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object(__DIR__"obj/jiaofu")->wear();
}
