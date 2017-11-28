#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();

void create()
{
        set_name("无尘道长", ({"wuchen daozhang", "wuchen", "daozhang"}));
        set("title", "红花会二当家");
        set("nickname", HIR "追魂夺命剑" NOR );
        set("gender", "男性");
        set("age", 52);
        set("long", "无尘道人少年时混迹绿林，劫富济贫，做下\n"
                    "了无数巨案，后因一事万念惧恢，出家做了\n"
                    "道人。凭自身所创的一套追魂夺命剑威镇江\n"
                    "湖，后被红花会老当家于万亭请出来做了副\n"
                    "手。\n");
        set("attitude", "peaceful");
        set("class", "taoist");
        set("shen_type", 1);
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 5500);
        set("max_qi", 5500);
        set("jing", 4200);
        set("max_jing", 4200);
        set("neili", 5500);
        set("max_neili", 5500);
        set("jiali", 180);
        set("combat_exp", 4000000);
        set("score", 1000000);

        set_skill("force", 240);
        set_skill("honghua-xinfa", 240);
        set_skill("tianchi-neigong", 240);
        set_skill("unarmed", 260);
        set_skill("lianhuan-mizongtui", 260);
        set_skill("dodge", 260);
        set_skill("yanzi-chuanyun", 240);
        set_skill("zhuihun-jian", 260);
        set_skill("parry", 240);
        set_skill("sword", 260);
        set_skill("taoism", 150);
        set_skill("martial-cognize", 220);
        set_skill("literate", 200);

        map_skill("force"  , "tianchi-neigong");
        map_skill("unarmed", "lianhuan-mizongtui");
        map_skill("dodge"  , "lianhuan-mizongtui");
        map_skill("parry"  , "zhuihun-jian");
        map_skill("sword"  , "zhuihun-jian");

        create_family("红花会", 4, "当家");

        set("inquiry", ([
                "夺命连环" : (: ask_skill1 :),
                "追魂夺命" : (: ask_skill2 :),
                "诛天刹神" : (: ask_skill3 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.zhu" :),
                (: perform_action, "sword.zhui" :),
                (: perform_action, "unarmed.lian" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
        setup();
        
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/greyrobe")->wear();
    
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 20000)
        {
                command("say 你非我侠义中人，我不能收你。");
                return;
        }

        if ((int)me->query("combat_exp") < 350000)
        {
                command("say 你的江湖经验太浅，就算收了你，恐怕也难有作为。");
                return;
        }

        if ((int)me->query_skill("honghua-xinfa", 1) < 80)
        {
                command("say 你内功修炼得太差，下去把本门的心法练好了再来。");
                return;
        }

        if ((int)me->query_skill("sword", 1) < 80)
        {
                command("say 你的剑法练成这样，叫我如何传你精深的剑技？");
                return;
        }

        command("haha");
        command("say 既然如此，那你以后就跟着我好了。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/lianhuan-mizongtui/lian"))
                return "这招俺不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("lianhuan-mizongtui", 1) < 1)
                return "你连连环迷踪腿都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 600)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 50000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("dodge") < 150)
                return "你的轻功火候不足，学不成这招。";

        if (me->query("max_neili") < 1800)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("lianhuan-mizongtui", 1) < 120)
                return "你的连环迷踪腿还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "大笑数声，对$N" HIY "说道：“想不到"
                       "你的腿法居然能有如此造\n诣，今日我传你这招又何妨"
                       "？”说罢，$n" HIY "随即摆开架势，慢\n慢的演示招数"
                       "。\n" NOR, me, this_object());

        command("haha");
        command("say 对不义之人一上来就要痛下杀手，丝毫不要留情。");
        tell_object(me, HIC "你学会了「夺命连环」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("lianhuan-mizongtui"))
                me->improve_skill("lianhuan-mizongtui", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/lianhuan-mizongtui/lian", 1);
        me->add("gongxian", -600);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhuihun-jian/zhui"))
                return "自己下去练，别跟我纠缠个没完！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("zhuihun-jian", 1) < 1)
                return "你连追魂夺命剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 35000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 120)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 800)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("zhuihun-jian", 1) < 100)
                return "你的追魂夺命剑还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "点了点头，从怀中轻轻取出了一本"
                       "剑谱，指着其中一段对\n$N" HIY "细说良久，$N"
                       HIY "一边听一边点头。\n" NOR, me, this_object());

        command("nod");
        command("say 这是我早期的得意之作，看似复杂实却并不难练。");
        tell_object(me, HIC "你学会了「追魂夺命」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("zhuihun-jian"))
                me->improve_skill("zhuihun-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhuihun-jian/zhui", 1);
        me->add("gongxian", -300);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhuihun-jian/zhu"))
                return "多说无益，赶快去练功，以后行侠仗义就靠你们了。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本会素无瓜葛，何出此言？";

        if (me->query_skill("zhuihun-jian", 1) < 1)
                return "你连追魂夺命剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1200)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 80000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (! me->query("can_perform/zhuihun-jian/zhui"))
                return "这招是由「追魂夺命」演化而来，等你通晓那招后再来吧。";

        if (me->query_skill("force") < 200)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1800)
                return "你的内力修为不够，学不成这招。";

        if (me->query_skill("zhuihun-jian", 1) < 160)
                return "你的追魂夺命剑还练得不到家，自己下去练练再来吧！";

        message_vision( HIY "$n" HIY "凝视了$N" HIY "好一会儿，随即大笑数"
                        "声，赞道：“不错，不错。\n今日我传你这招，可要看"
                        "好了！”$n" HIY "话音刚落，随即便一声\n清啸，手"
                        "中长剑龙吟不止，迸出万道光华疾闪而过。顿时只见石"
                        "屑\n飞溅，只听“嗤”的一声，$N" HIY "对面的青石"
                        "桌案竟已被$n" HIY "手中\n长剑激荡出的剑芒贯穿，"
                        "砖地尚留下碗口粗的大洞，直看得$N" HIY "目瞪\n口"
                        "呆，半天说不出一句话。\n" NOR, me, this_object());

        command("haha");
        command("say 这招是我生平力作，也不知用它杀了多少奸恶之徒。");
        tell_object(me, HIC "你学会了「诛天刹神」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("zhuihun-jian"))
                me->improve_skill("zhuihun-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhuihun-jian/zhu", 1);
        me->add("gongxian", -1200);
        return 1;
}

