#include <ansi.h>
#include "duan.h"

#define MAIJING "/clone/lonely/book/jingluoxue1"
#define MAIJING2 "/clone/lonely/book/jingluoxue2"

inherit NPC;
inherit F_MASTER;

mixed ask_maijing1();
mixed ask_maijing2();

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();

void create()
{
        set_name("段正明", ({ "duan zhengming", "duan", "zhengming" }));
        set("title", "大理国国王" );
        set("nickname", HIY "保定帝" NOR);
        set("long", "他就是大理国的国王，继承这近三百年的基业。\n");
        set("gender", "男性");
        set("age", 49);
        set("class", "royal");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 32);
        set("int", 35);
        set("con", 32);
        set("dex", 29);

        set("max_qi", 6000);
        set("max_jing", 4000);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 200);
        set("combat_exp", 3000000);
        set("score", 60000);

        set_skill("force", 280);
        set_skill("duanshi-xinfa", 280);
        set_skill("kurong-changong", 240);
        set_skill("dodge", 240);
        set_skill("tiannan-bu", 240);
        set_skill("cuff", 240);
        set_skill("jinyu-quan", 240);
        set_skill("strike", 240);
        set_skill("wuluo-zhang", 240);
        set_skill("sword", 240);
        set_skill("staff", 240);
        set_skill("duanjia-jian", 240);
        set_skill("finger", 280);
        set_skill("qiantian-zhi", 260);
        set_skill("yiyang-zhi", 280);
        set_skill("parry", 240);
        set_skill("jingluo-xue", 280);
        set_skill("buddhism", 260);
        set_skill("literate", 260);
        set_skill("martial-cognize", 260);

        map_skill("force", "kurong-changong");
        map_skill("dodge", "tiannan-bu");
        map_skill("finger", "yiyang-zhi");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("parry", "yiyang-zhi");
        map_skill("sword", "duanjia-jian");
        map_skill("staff", "yiyang-zhi");

        prepare_skill("finger", "yiyang-zhi");

        create_family("段氏皇族", 15, "传人");

        set("inquiry", ([
                "五绝连环"   : (: ask_skill1 :),
                "起死回生"   : (: ask_skill2 :),
                "神指点穴"   : (: ask_skill3 :),
                "一指乾坤"   : (: ask_skill4 :),
                "王叔和脉经" : (: ask_maijing1 :),
                "玉颧神脉经" : (: ask_maijing2 :),
                "阳关三叠"   : "唉…说来惭愧，这一招连我自己都还未领悟透彻。",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "finger.qian" :),
                (: perform_action, "finger.dian" :),
                (: perform_action, "finger.die" :),
                (: perform_action, "sword.jing" :),
                (: perform_action, "sword.lian" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 50);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query("shen") < 50000)
        {
                command("say 你江湖上的名声不怎么样，这样的人如何能够治好"
                        "国家？");
                return;
        }


        if (ob->query_skill("duanshi-xinfa", 1) < 100)
        {
                command("say 你先好好学习我们段家的心法，以后我再指点你。");
                return;
        }

        if (ob->query("combat_exp") < 400000)
        {
                command("say 你实战经验太低，应好好在江湖上历炼，不要失了"
                        "段氏的面子。\n");
                return;
        }

        command("say 好，我收下你了，武技固然重要，也不要忘记读书治国。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/duanjia-jian/lian"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("duanjia-jian", 1) < 1)
                return "你连段家剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query("shen") < 0)
                return "算了吧，传你绝招只怕你又去作恶！";

        if (me->query_skill("force") < 160)
                return "你的内功的修为不够，练高了再来吧。";

        if (me->query_skill("duanjia-jian", 1) < 120)
                return "你的段家剑法还不行，练练再说吧！";

        message_sort(HIY "\n$n" HIY "点了点头，喝道：“看好了！”忽然欺上前"
                     "来，以手为剑，接连攻出数招，招式精奇无比，$N" HIY "大"
                     "吃一惊，只能后退。\n\n" NOR, me, this_object());

        command("nod");
        command("say 你看清楚了么？以后要行侠仗义，莫要胡作非为！");
        tell_object(me, HIC "你学会了「五绝连环」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("duanjia-jian"))
                me->improve_skill("duanjia-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/duanjia-jian/lian", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yiyang-zhi/heal"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("yiyang-zhi", 1) < 1)
                return "你连一阳指诀都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 800)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query_skill("force") < 150)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("jingluo-xue", 1) < 100)
                return "你对经络学的了解还不透彻，研究透了再来找我吧。";

        if (me->query_skill("yiyang-zhi", 1) < 100)
                return "你的一阳指诀功力还不够，练高了再说吧。";

        message_sort(HIY "\n$n" HIY "微微一笑，伸出一指，出手如风，瞬间"
                     "拂过$N" HIY "胸前诸多大穴，$N" HIY "顿时只觉$n" HIY
                     "内力源源不绝的涌入，全身一阵酸麻，不禁大惊失色。\n"
                     "\n" NOR, me, this_object()); 

        command("smile");
        command("say 招式便是如此，你懂了吗？");
        command("say 此招疗伤效果虽是天下无双，但对自身的损害却是太大。");
        tell_object(me, HIC "你学会了「起死回生」。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yiyang-zhi/heal", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yiyang-zhi/dian"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("yiyang-zhi", 1) < 1)
                return "你连一阳指诀都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query("shen") < 20000)
                return "你侠义正事做得不够，这招我暂时还不能传你！";

        if (me->query_skill("force") < 160)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 1800)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("jingluo-xue", 1) < 120)
                return "你对经络学的了解还不透彻，研究透了再来找我吧。";

        if (me->query_skill("yiyang-zhi", 1) < 120)
                return "你的一阳指诀功力还不够，练高了再说吧。";

        message_sort(HIY "\n$n" HIY "略微点了点头，说道：“看好了！”说罢$n"
                     HIY "凝聚一阳指诀功力，陡然点出一指，变化多端，巧逼$N"
                     HIY "诸处大穴，招式煞为精妙。\n\n" NOR, me, this_object()); 

        command("haha");
        command("say 招式便是如此，你自己下去练吧。");
        tell_object(me, HIC "你学会了「神指点穴」。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yiyang-zhi/dian", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yiyang-zhi/qian"))
                return "你不是已经学会了么？还有什么疑问？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query_skill("yiyang-zhi", 1) < 1)
                return "你连一阳指诀都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1000)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query("shen") < 30000)
                return "你侠义正事做得不够，这招我暂时还不能传你！";

        if (me->query_skill("force") < 220)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 2400)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("jingluo-xue", 1) < 160)
                return "你对经络学的了解还不透彻，研究透了再来找我吧。";

        if (me->query_skill("yiyang-zhi", 1) < 160)
                return "你的一阳指诀功力还不够，练高了再说吧。";

        message_sort(HIY "\n$n" HIY "凝视了$N" HIY "好一会儿，随即点了点"
                     "头，将$N" HIY "招至身边，在耳旁低声细说良久，$N" HIY
                     "听后会心的一笑，看来对$n" HIY "的教导大有所悟。\n\n"
                     NOR, me, this_object()); 

        command("nod");
        command("say 此招杀伤略重，平时一定要慎用。");
        tell_object(me, HIC "你学会了「一指乾坤」。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yiyang-zhi/qian", 1);
        me->add("gongxian", -1000);

        return 1;
}


mixed ask_maijing1()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "段氏皇族")
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query("family/master_id") != query("id"))
                return "…嗯…等你成为我的弟子后再说吧。";

        if (me->query("shen") < 10000)
                return "你侠义正事做得不够，这脉经我不能给你。";

        if (me->query("combat_exp") < 10000)
                return "你现在经验太浅，不用忙着去阅读脉经。";

        if (me->query_skill("jingluo-xue", 1) > 149)
                return "你对经络学的了解已经很透彻，远胜脉经中所述。";

        ob = find_object(MAIJING);
        if (! ob) ob = load_object(MAIJING);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我那本王叔和脉经不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…脉经现在不在我手里。";

                if (owner->query("family/family_name") == "段氏皇族")
                        return "那书现在暂时是你兄弟" + owner->query("name") +
                               "在看，你要用就去找他吧。";
                else
                        return "我那本脉经现在落在了" + owner->query("name") +
                               "手中，你去找他索回吧。";
        }
        ob->move(this_object());
        command("say 这本脉经你就拿去看吧，可要认真研读。");
        command("give mai jing to " + me->query("id"));
        return 1;
}

mixed ask_maijing2()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        
        if (me->query("family/family_name") != "段氏皇族")
                return "你又不是我们段家的传人，这话是什么意思？";

        if (me->query("family/master_id") != query("id"))
                return "…嗯…等你成为我的弟子后再说吧。";

        if (me->query("shen") < 80000)
                return "你侠义正事做得不够，这脉经我不能给你。";

        if (me->query("combat_exp") < 300000)
                return "你现在经验太浅，不用忙着去阅读脉经。";

        if (me->query_skill("jingluo-xue", 1) > 199)
                return "你对经络学的了解已经很透彻，远胜脉经中所述。";

        ob = find_object(MAIJING2);
        if (! ob) ob = load_object(MAIJING2);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我那本玉颧神脉经不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…脉经现在不在我手里。";

                if (owner->query("family/family_name") == "段氏皇族")
                        return "那书现在暂时是你兄弟" + owner->query("name") +
                               "在看，你要用就去找他吧。";
                else
                        return "我那本脉经现在落在了" + owner->query("name") +
                               "手中，你去找他索回吧。";
        }
        ob->move(this_object());
        command("say 这本脉经你就拿去看吧，可要认真研读。");
        command("give yuquan jing to " + me->query("id"));
        return 1;
}
