#include <ansi.h>
inherit NPC;

void create()
{
        set_name("高处不胜寒", ({ "gaochu busheng han", "gaochu", "han", "lonely" }) );
        set("gender", "男性" );
        set("age", 2100);
        set("long", HIC "他就是泥潭世界的大boss——高处不胜寒。\n" NOR);
        set("attitude", "friendly");
        set("max_jing", 25000);
        set("max_qi", 25000);
        set("max_jingli", 50000);
        set("jingli", 50000);
        set("max_neili", 50000);
        set("neili", 50000);
        set("jiali", 375);
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        set("combat_exp", 100000000);
        //set("level", 999);

        set("inquiry", ([
                "精元丹" : "精元丹我的确有，不过赠给有能力之人，你先露一手给我瞧瞧。\n",                
        ]));
                
        set_skill("unarmed", 999);
        set_skill("sword", 999);
        set_skill("blade", 999);
        set_skill("staff", 999);
        set_skill("hammer", 999);
        set_skill("club", 999);
        set_skill("whip", 999);
        set_skill("dagger", 999);
        set_skill("throwing", 999);
        set_skill("parry", 999);
        set_skill("dodge", 999);
        set_skill("force", 999);
        set_skill("count", 999);
        set_skill("never-defeated", 999);
        set_skill("martial-cognize", 999);

        map_skill("sword", "never-defeated");
        map_skill("blade", "never-defeated");
        map_skill("staff", "never-defeated");
        map_skill("hammer", "never-defeated");
        map_skill("club", "never-defeated");
        map_skill("whip", "never-defeated");
        map_skill("dagger", "never-defeated");
        map_skill("parry", "never-defeated");
        map_skill("dodge", "never-defeated");
        map_skill("force", "never-defeated");

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "sword.po" :),
                (: exert_function, "sword.juemie" :),
                (: exert_function, "sword.lei" :),
                (: exert_function, "sword.tianhua" :),
                (: exert_function, "sword.wanli" :),
                (: exert_function, "sword.yuce" :),
        }) );
        
        setup();

        set_temp("apply/damage", 300); 
        set_temp("apply/unarmed_damage", 300); 
        set_temp("apply/armor", 600); 
                
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/zhujian")->wield();
        
        create_family("人神魔三界", 1, "三界之主");
        set("title", HIR "三界之主" NOR);        
}

void init()
{
        object me;

        if (! interactive(me = this_player()))
                return;

        if (ultrap(me))
        {
                message_vision(CYN "$N" CYN "微微一笑，对$n"
                               CYN "点了点头。\n" NOR,
                               this_object(), me);
        }
}

int accept_fight(object ob)
{
        if (query_competitor() == ob)
                return 1;

        if (is_fighting())
        {
                command("say 你等会，让我把面前的这个家伙放倒再说。");
                return 0;
        }

        if (query("qi") < query("eff_qi") * 2 / 3
           || query("jing") < query("eff_jing") * 2 / 3
           || query("neili") < query("max_neili") * 2 / 3)
        {
                command("say 我现在有点疲倦，待我歇会儿再说。");
                return 0;
        }

        command("nod");
        command("say 就让我试一试你的身手，看看你究竟有啥水平？");
        competition_with(ob);
        return 1;
}

void lost()
{
        object me, ob;

        me = query_competitor();

        ob = new("/d/death/obj/jingyuandan");
        ob->move(this_object());

        command("say 厉害，厉害。既然你胜过了我，这个精元丹就拿去吧。");
        command("give jingyuan dan to " + me->query("id"));
        me->set("SkyPass", 1);
        message_vision(HIR "只见一道红光照着你，将你带回阎罗殿。\n" NOR, 
                       this_object(), me);        
        me->move("/d/death/yanluodian");
        ::lost();
}

void win()
{
        object me = query_competitor();

        if (! objectp(me))
        {
                command("heihei");
                return;
        }
        command("say 就你这点水平也想闯天界十二重天？下去练练再来吧。");
        message_vision(HIR "只见一道红光照着你，将你带回阎罗殿。\n" NOR, 
                       this_object(), me);        
        me->move("/d/death/yanluodian");
        ::win();
}

int accept_kill(object me)
{
        if (me->query("combat_exp") < 20000000)
        {
                message_vision(CYN "$N" CYN "大怒道：“无名小辈捣"
                               "什么乱？给我滚！”说罢一掌把$n" CYN
                               "劈倒在地。\n" NOR, this_object(), me);
                me->unconcious();
                return -1;
        }
        command("sigh");
        command("say 很好！近年还真没有遇到什么敢和我较量的高手！");
        return 1;
}
