#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("骆冰", ({ "luo bing", "luo", "bing"}));
        set("title", "红花会十一当家");
        set("nickname", HIC "鸳鸯刀" NOR);
        set("long", "这是一个秀美的少妇。一手短刀，一手握着一\n"
                    "柄长刀。\n");
        set("gender", "女性");
        set("age", 34);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 1800);
        set("max_qi", 1800);
        set("jing", 1200);
        set("max_jing", 1200);
        set("neili", 2500);
        set("max_neili", 2500);
        set("jiali", 80);
        set("combat_exp", 500000);
        set("score", 1000);

        set_skill("force", 120);
        set_skill("honghua-xinfa", 120);
        set_skill("unarmed", 120);
        set_skill("changquan", 120);
        set_skill("dodge", 140);
        set_skill("yanzi-chuanyun", 140);
        set_skill("blade", 140);
        set_skill("hanwang-qingdao", 140);
        set_skill("parry", 120);
        set_skill("martial-cognize", 100);
        set_skill("literate", 140);

        map_skill("force"  , "honghua-xinfa");
        map_skill("blade"  , "hanwang-qingdao");
        map_skill("unarmed" , "changquan");
        map_skill("dodge"  , "yanzi-chuanyun");
        map_skill("parry"  , "hanwang-qingdao");

        prepare_skill("unarmed", "changquan");

        create_family("红花会", 4, "当家");

        set("inquiry", ([
                "刀影重重"  : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "blade.ying" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
        setup();

        carry_object("/clone/cloth/jinduan")->wear();
        carry_object("/clone/weapon/gangdao")->wield();    
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < -1000)
        {
                command("say 我红花会不收不义之人，你还是走吧。");
                return;
        }

        command("xixi");
        command("say 既然这样，我就收下你好了。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/hanwang-qingdao/ying"))
                return "你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("hanwang-qingdao", 1) < 1)
                return "你连韩王青刀都没学，何谈此言？";

        if (me->query("gongxian") < 80)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 5000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 120)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("hanwang-qingdao", 1) < 80)
                return "你的韩王青刀还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "点了点头，将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "听"
                       "后会心\n的一笑，看来大有所悟。\n" NOR,
                       me, this_object());

        command("nod");
        command("say 刚才我所说的便是韩王青刀的精要，你可记清了？");
        tell_object(me, HIC "你学会了「刀影重重」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("hanwang-qingdao"))
                me->improve_skill("hanwang-qingdao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/hanwang-qingdao/ying", 1);
        me->add("gongxian", -80);

        return 1;
}
