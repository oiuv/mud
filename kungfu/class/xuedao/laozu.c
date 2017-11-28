#include <ansi.h>
#include "xuedao.h"

#define XUEDAO    "/clone/lonely/xuedao"
#define JING      "/clone/lonely/book/xuedao"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();
mixed ask_skill7();
mixed ask_skill8();
mixed ask_skill9();

mixed ask_dao();
mixed ask_book();
mixed ask_midao();

void create()
{
        object ob;
        set_name("血刀老祖", ({ "xuedao laozu", "xuedao", "laozu", "xue", "lao" }));
        set("long", @LONG
这喇嘛身着黄袍，年纪极老，尖头削耳，脸上都是
皱纹。他就是血刀门第四代掌门。
LONG);
        set("gender", "男性");
        set("age", 85);
        set("attitude", "peaceful");
        set("shen_type", -1);

        set("str", 33);
        set("int", 31);
        set("con", 35);
        set("dex", 32);
        set("max_qi", 5500);
        set("max_jing", 4000);
        set("neili", 5800);
        set("max_neili", 5800);
        set("jiali", 200);
        set("combat_exp", 3500000);

        set_skill("force", 280);
        set_skill("xuedao-dafa", 280);
        set_skill("mizong-neigong", 260);
        set_skill("blade", 280);
        set_skill("xueshan-dao", 260);
        set_skill("honglian-dao", 260);
        set_skill("sword", 240);
        set_skill("mingwang-jian", 240);
        set_skill("dodge", 260);
        set_skill("shenkong-xing", 260);
        set_skill("hand", 260);
        set_skill("dashou-yin", 260);
        set_skill("cuff", 260);
        set_skill("yujiamu-quan", 260);
        set_skill("parry", 260);
        set_skill("lamaism", 240);
        set_skill("literate", 200);
        set_skill("martial-cognize", 260);

        map_skill("force", "xuedao-dafa");
        map_skill("dodge", "shenkong-xing");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");
        map_skill("parry", "xuedao-dafa");
        map_skill("blade", "xuedao-dafa");
        map_skill("sword", "mingwang-jian");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "blade.ying" :),
                (: perform_action, "blade.chi" :),
                (: perform_action, "blade.xue" :),
                (: perform_action, "blade.shi" :),
                (: perform_action, "hand.yin" :),
                (: perform_action, "cuff.jiang" :),
                (: exert_function, "recover" :),
                (: exert_function, "resurrect" :),
                (: exert_function, "powerup" :),

        }) );

        create_family("血刀门", 4, "掌门");
        set("class", "bonze");

        set("inquiry", ([
                "血刀"      : (: ask_dao :),
                "血刀经"    : (: ask_book :),
                "密道"      : (: ask_midao :),
                "秘道"      : (: ask_midao :),
                "浴血重生"  : (: ask_skill1 :),
                "金刚印"    : (: ask_skill2 :),
                "修罗降世"  : (: ask_skill3 :),
                "若悲"      : (: ask_skill4 :),
                "降魔"      : (: ask_skill5 :),
                "无影神刀"  : (: ask_skill6 :),
                "赤炼神刀"  : (: ask_skill7 :),
                "祭血神刀"  : (: ask_skill8 :),
                "噬血穹苍"  : (: ask_skill9 :),
                "冰河开封"  : "这一招你去让胜谛教你好了。",
                "流星火雨"  : "这一招你去让宝象教你好了。",
                "血海无边"  : "操！老子让你去跟铁匠接口，你来问我干嘛？",
        ]));

        setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 

        if (clonep())
        {
                ob = find_object(XUEDAO);
                if (! ob) ob = load_object(XUEDAO);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("clone/weapon/jiedao");
                        ob->move(this_object());
                        ob->wield();
                }
        }

        carry_object("/d/xueshan/obj/y-jiasha")->wear();
        add_money("silver", 20);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") == "女性")
        {
                command("say 老夫不收女徒弟，不过可以陪你玩玩。\n");
                return;
        }

        if ((string)ob->query("gender") != "男性")
        {
                command("say 我平生最看不惯的就是阉人，再不滚开我杀了你！\n");
                return;
        }

        if (ob->query("class") != "bonze")
        {
                ob->set_temp("pending/join_bonze", 1);
                command("say 你不是出家人，我们血刀门是不会收留的。"
                        "如果你要出家，去找善勇。");
                return;
        }

        if ((int)ob->query("combat_exp") < 350000)
        {
                command("say 你的实战经验也忒差了，回去好好给我练功去！");
                return;
        }

        if ((int)ob->query("shen") > -50000)
        {
                command("say 你是不是向着侠义道，连杀人都不会！\n");
                return;
        }

        if ((int)ob->query_skill("lamaism", 1) < 140)
        {
                command("say 虽说咱们平时烧杀抢掠，但总归也算是佛门弟子。\n");
                command("say 待你的密宗佛法提高后再来找我吧。\n");
                return;
        }

        if ((int)ob->query_skill("mizong-neigong", 1) < 100)
        {
                command("say 你这个废物！怎么练的？内功这么差！\n");
                return;
        }

        if ((int)ob->query_skill("blade", 1) < 120)
        {
                command("say 你刀法这么差，还有脸来见我？\n");
                return;
        }

        command("sneer");
        command("say 那你以后就跟着老夫好了。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xuedao-dafa/resurrect"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("xuedao-dafa", 1) < 1)
                return "你连血刀大法都没学，还啰嗦什么？";

        if (me->query("gongxian") < 500)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -60000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query("max_neili") < 1000)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("xuedao-dafa", 1) < 120)
                return "等你把血刀大法练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "微微一笑，当下也不答话，只是伸出右手，轻轻放"
                       "在\n$N" HIY "胸口。正当$N" HIY "疑惑间，却见$n" HIY "掌劲"
                       "轻吐，$N" HIY "顿时全身\n一震，如遭电击，各处经脉无不舒畅"
                       "，说不出的受用。\n" NOR, me, this_object());

        command("sneer");
        command("say 明白了么？");
        tell_object(me, HIC "你学会了「浴血重生」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("xuedao-dafa"))
                me->improve_skill("xuedao-dafa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuedao-dafa/resurrect", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/dashou-yin/yin"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("dashou-yin", 1) < 1)
                return "你连大手印都没学，还啰嗦什么？";

        if (me->query("gongxian") < 200)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -15000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 140)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 1000)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("dashou-yin", 1) < 100)
                return "等你把大手印练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "冷笑一声，上下打量了$N" HIY "一番，点了点头"
                       "。当下凝神\n沉履，面容庄重，双手携着劲风奋力向$N" HIY "面前"
                       "的一座舍利佛塔\n拍落，顿时只听轰然一声闷响，佛塔内的香灰"
                       "被$n" HIY "的掌\n力激荡得四处飞扬，尘烟弥漫，待得烟消云散"
                       "后，$N" HIY "这才发现\n那座舍利佛塔上豁然嵌着一双掌印。\n"
                       NOR, me, this_object());

        command("nod");
        command("say 只要内功精纯，这招并不难练。");
        tell_object(me, HIC "你学会了「金刚印」。\n" NOR);

        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("dashou-yin"))
                me->improve_skill("dashou-yin", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/dashou-yin/yin", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/yujiamu-quan/jiang"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("yujiamu-quan", 1) < 1)
                return "你连金刚瑜迦母拳都没学，还啰嗦什么？";

        if (me->query("gongxian") < 300)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -18000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 150)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 1200)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("yujiamu-quan", 1) < 100)
                return "等你把金刚瑜迦母拳练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "略微点了点头，深深呼入一口气，纵步上前，嗔目"
                       "大\n喝，拳招迭出，疾如奔雷，霎时已向$N" HIY "攻出数拳，招"
                       "式甚为精\n妙。实乃$N" HIY "前所未闻。\n" NOR, me,
                       this_object());;

        command("haha");
        command("say 看清楚了？");
        tell_object(me, HIC "你学会了「修罗降世」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("yujiamu-quan"))
                me->improve_skill("yujiamu-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yujiamu-quan/jiang", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/mingwang-jian/ruo"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("mingwang-jian", 1) < 1)
                return "你连不动明王剑都没学，还啰嗦什么？";

        if (me->query("gongxian") < 100)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -10000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 140)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 1200)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("mingwang-jian", 1) < 100)
                return "等你把不动明王剑练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "冷笑一声，也不答话，从$N" HIY "手中接过长剑"
                       "，手腕轻轻\n一抖，长剑顿时发出一阵低沉的轻鸣，鸣音入耳，"
                       "$N" HIY "只感到心\n头一震，竟涌上一股莫名的悲哀。\n" NOR,
                       me, this_object());

        command("haha");
        command("say 道理很简单，你自己下去练吧。");
        tell_object(me, HIC "你学会了「若悲」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("mingwang-jian"))
                me->improve_skill("mingwang-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/mingwang-jian/ruo", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/mingwang-jian/xiang"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("mingwang-jian", 1) < 1)
                return "你连不动明王剑都没学，还啰嗦什么？";

        if (me->query("gongxian") < 400)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -15000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 180)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 1600)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("mingwang-jian", 1) < 140)
                return "等你把不动明王剑练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "对$N" HIY "微微一笑，随即伸出右手，中食二指"
                       "并拢，捏作\n剑诀，“嗤”的一声空点而出，霎时破空之声骤响"
                       "，一股气劲\n从指尖迸发，将$N" HIY "所穿戴的僧袍刺透出一个"
                       "小孔。\n" NOR, me, this_object());

        command("sneer");
        command("say 此招不外乎是以剑作媒，以气伤人。");
        tell_object(me, HIC "你学会了「降魔」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("mingwang-jian"))
                me->improve_skill("mingwang-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/mingwang-jian/xiang", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xuedao-dafa/ying"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("xuedao-dafa", 1) < 1)
                return "你连血刀大法都没学，还啰嗦什么？";

        if (me->query("gongxian") < 300)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -60000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 160)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 1500)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("xuedao-dafa", 1) < 120)
                return "等你把血刀大法练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "狞笑一声，对$N" HIY "说道：“乖徒儿，老夫这"
                       "就给你演示\n一遍，看好了！”$n" HIY "说完便抽出腰间血刀，"
                       "陡然一声大\n喝，将手中的血刀舞动如轮，顿时刀锋激起层层血"
                       "浪逼向$N" HIY "而\n去，直将看得$N" HIY "目瞪口呆。\n" NOR,
                       me, this_object());

        command("haha");
        command("say 这招的要诀就是一个快字，看懂了么？");
        tell_object(me, HIC "你学会了「无影神刀」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("xuedao-dafa"))
                me->improve_skill("xuedao-dafa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuedao-dafa/ying", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xuedao-dafa/chi"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("xuedao-dafa", 1) < 1)
                return "你连血刀大法都没学，还啰嗦什么？";

        if (me->query("gongxian") < 800)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -70000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 220)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 2400)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("xuedao-dafa", 1) < 160)
                return "等你把血刀大法练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "嘿嘿一笑，伸手将$N" HIY "招到身前，低声在$N"
                       HIY "耳旁嘀咕了\n半天。随后$n" HIY "又拔出腰间的血刀挥舞数"
                       "下，似乎是一种\n颇为诡异的刀诀。\n" NOR, me, this_object());

        command("haha");
        command("say 精要我都告诉你了，自己下去练吧。");
        tell_object(me, HIC "你学会了「赤炼神刀」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("xuedao-dafa"))
                me->improve_skill("xuedao-dafa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuedao-dafa/chi", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill8()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xuedao-dafa/xue"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("xuedao-dafa", 1) < 1)
                return "你连血刀大法都没学，还啰嗦什么？";

        if (me->query("gongxian") < 1000)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -80000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 220)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 2400)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("xuedao-dafa", 1) < 160)
                return "等你把血刀大法练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "看了看$N" HIY "，狞笑一声，点了点头。便伸手将"
                       "$N" HIY "招到身\n前，低声在$N" HIY "耳旁嘀咕了半天。$N" HIY
                       "听后脸色大变，似乎听到了\n什么劾人听闻的事情，待$n" HIY "继"
                       "续讲解了一阵，$N" HIY "的表情\n才慢慢松弛了下来，随即会心地"
                       "一笑，看来有所领悟。\n" NOR, me, this_object());

        command("grin");
        command("say 这招的要领就是义无返顾，拼死一攻，记住了吗？");
        tell_object(me, HIC "你学会了「祭血神刀」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("xuedao-dafa"))
                me->improve_skill("xuedao-dafa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuedao-dafa/xue", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill9()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xuedao-dafa/shi"))
                return "自己下去练，啰嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是什么人？我看你怎么不象是我血刀门的弟子呢？";

        if (me->query_skill("xuedao-dafa", 1) < 1)
                return "你连血刀大法都没学，还啰嗦什么？";

        if (me->query("gongxian") < 2000)
                return "你帮老夫多做点事，老夫自然会传你绝技。";

        if (me->query("shen") > -100000)
                return "你这人是怎么做的？连杀人都不会了？";

        if (me->query_skill("force") < 250)
                return "你的内功修为实在太差，修炼高了再来找老夫吧。";

        if (me->query("max_neili") < 2600)
                return "你的内力差成这样，居然还好意思来找老夫？";

        if (me->query_skill("xuedao-dafa", 1) < 180)
                return "等你把血刀大法练熟了再来找老夫。";

        message_vision(HIY "$n" HIY "望着$N" HIY "干笑了数声，说道：“想不到居然那么"
                       "快就有\n人能够继承我这一招，我血刀门真是后继有人啊。今日我便"
                       "传\n你这式「噬血穹苍」绝技。”话音刚落，随即只见$n" HIY "仰\n"
                       "天一声狂哮，手中血刀一振，顿时迸发出漫天血光，腾起无边\n杀意"
                       "。快刀连闪，赤芒暴展，竟似一个巨大的血球将$n" HIY "\n包裹在其"
                       "中，刀法之凌厉，实乃世所罕见。\n" NOR, me, this_object());

        command("haha");
        command("say 将赤炼、祭血两招合一，便是新招。你自己下去练吧。");
        tell_object(me, HIC "你学会了「噬血穹苍」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("xuedao-dafa"))
                me->improve_skill("xuedao-dafa", 1500000);
        if (me->can_improve_skill("xuedao-dafa"))
                me->improve_skill("xuedao-dafa", 1500000);
        if (me->can_improve_skill("xuedao-dafa"))
                me->improve_skill("xuedao-dafa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuedao-dafa/shi", 1);
        me->add("gongxian", -2000);

        return 1;
}

mixed ask_midao()
{
        object me;

        me = this_player();
        if (me->query("family/family_name") != "血刀门")
                return "你他奶奶的，嘀嘀咕咕到底要说什么？";

        command("whisper " + me->query("id") + " 你既然已经入我门来，以"
                "后若\n要去中原办事，即可用我门血刀先辈们留下的密道，你"
                "可到山\n外杂物堆处进入(" NOR + HIY "enter mash" NOR + WHT
                ")，然后便能到达中原扬州。回来\n是找我血刀伏在中原的铁匠"
                "，接口密语是" NOR + HIR "血海无边" NOR + WHT "。\n");
        return "此秘密不可泄露于他人，否则天诛地灭！";
}

mixed ask_dao()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_good())
        {
                if (me->query("family/family_name") == "血刀门")
                        message_vision(CYN "$N" CYN "大怒，对$n" CYN "道：“你身"
                                       "为我血刀门弟子，反而学起假仁假义来了，居"
                                       "然还有脸问我要本门之宝？”\n" NOR,
                                       this_object(), me);
                else
                        message_vision(CYN "$N" CYN "大怒，对$n" CYN "喝道：“你"
                                       "是什么人？居然敢贪图本门至宝，你再问看我"
                                       "不宰了你！”\n" NOR,
                                       this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") != "血刀门")
                return "血刀是我血刀门至宝，你打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才能用血刀，你还是自己下去练练吧。";

        if (me->query("shen") > -50000)
                return "你邪气不重，使用不了血刀。";

        ob = find_object(XUEDAO);
        if (! ob) ob = load_object(XUEDAO);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "他奶奶的，本门的血刀现在不是你拿着在用吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，血刀现在不在我手中。";

                if (owner->query("family/family_name") == "血刀门")
                        return "血刀现在暂时是你同门师兄" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "本门的血刀现在落在" + owner->query("name") +
                               "手中，你去把他做了，把血刀抢回来！";
        }

        ob->move(this_object());
        message_vision(CYN "$N" CYN "哈哈一笑，道：好，乖徒儿，这柄血刀你就"
                       "拿去，多杀几个正派人士，扬扬咱们的威风！\n" NOR,
                       this_object(), me);
        command("give xue dao to " + me->query("id"));
        return 1;
}

mixed ask_book()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "血刀门")
                return "哪里来的野种，竟敢打我血刀门的主意？";

        if (me->query("family/master_id") != query("id"))
                return "你又不是老夫的弟子，跟老夫啰嗦些什么？";

        if (me->query("shen") > -50000)
                return "你倒是学起假仁假义来了，让老夫如何能相信你？";

        if (me->query("combat_exp") < 300000)
                return "你现在经验太浅，这本血刀经你还看不懂。";

        if (me->query_skill("xuedao-dafa", 1) > 179)
                return "你的血刀大法火候已经很深了，血刀经对你起不了什么作用。";

        ob = find_object(JING);
        if (! ob) ob = load_object(JING);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我血刀门的宝经不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…血刀经现在不在我手里。";

                if (owner->query("family/family_name") == "血刀门")
                        return "血刀经现在暂时被你同门的" + owner->query("name") +
                               "取去看了，你要看就去找他吧。";
                else
                        return "我血刀门的宝经现在落在了" + owner->query("name") +
                               "手中，你去把它夺回来吧！";
        }
        ob->move(this_object());
        message_vision(CYN "$N" CYN "点头道：这本血刀经你就拿去看吧，可要仔细阅读。\n" NOR,
                       this_object(), me);
        command("give xuedao jing to " + me->query("id"));
        return 1;
}

int accept_object(object me, object ob)
{
        int r;
        if (r = ::accept_object(me, ob))
                return r;

        if (base_name(ob) != XUEDAO)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query("family/master_id") != query("id"))
                command("say 不错，不错！");
        else
                command("say 很好，很好！");
        destruct(ob);
        return 1;
}

void unconcious()
{
        die();
}