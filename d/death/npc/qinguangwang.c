#include <ansi.h>

inherit NPC;

void create()
{
        set_name("秦广王", ({ "qin guangwang", "qin", "guangwang" }));
        set("title", HIR "冥府地藏王殿前" NOR);
        set("nickname", WHT "魂王" NOR);
        set("shen_type", 1);

        set("gender", "男性");
        set("age", 475);
        set("long", "秦广王乃是阴间十王之一。\n");

        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        
        set("max_qi", 30000);
        set("max_jing", 30000);
        set("neili", 30000);
        set("max_neili", 30000);
        set("jiali", 200);
        
        set("combat_exp", 25000000);
        set("attitude", "friendly");
        

        set_skill("unarmed", 600);
        set_skill("finger", 600);
        set_skill("claw", 600);
        set_skill("strike", 600);
        set_skill("hand", 600);
        set_skill("cuff", 600);
        set_skill("parry", 600);
        set_skill("dodge", 600);
        set_skill("force", 600);
        set_skill("jiuyin-shengong", 600);
        set_skill("magic", 600);
        set_skill("literate", 600);

        map_skill("parry", "jiuyin-shengong");
        map_skill("force", "jiuyin-shengong");
        map_skill("dodge", "jiuyin-shengong");
        map_skill("unarmed", "jiuyin-shengong");
        map_skill("finger", "jiuyin-shengong");
        map_skill("strike", "jiuyin-shengong");
        map_skill("hand", "jiuyin-shengong");
        map_skill("cuff", "jiuyin-shengong");
        map_skill("claw", "jiuyin-shengong");

        prepare_skill("claw", "jiuyin-shengong");
        prepare_skill("cuff", "jiuyin-shengong");
        
        //apply由2000降低为200 by 薪有所属
        set_temp("apply/damage", 200);
        set_temp("apply/parry", 200);
        set_temp("apply/dodge", 200);
        set_temp("apply/attack", 200);
        set_temp("apply/force",200);

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "finger.zhi" :),
                (: perform_action, "strike.zhang" :),
                (: perform_action, "cuff.quan" :),
                (: perform_action, "hand.shou" :),
                (: perform_action, "claw.zhua" :),
                (: exert_function, "recover" :),
                (: exert_function, "shield" :),
        }) );
        
        create_family("阴司", 0, "总管");

        setup();
        carry_object(__DIR__"obj/cloth4")->wear();
        carry_object("/d/death/obj/qise");
}
