#include <ansi.h>
#include "taohua.h"

#define YUXIAO    "/clone/lonely/yuxiao"
#define TAOHUA    "/clone/lonely/book/taohua"
#define XIAOPU    "/clone/lonely/book/xiaopu"
#define XUANFENG  "/clone/lonely/book/xuanfengtui"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;
inherit F_QUESTER;

void   consider();

mixed  ask_leave();
mixed  ask_book1();
mixed  ask_book2();
mixed  ask_book3();
mixed  ask_book4();
mixed  ask_yuxiao();

mixed  ask_skill1();
mixed  ask_skill2();
mixed  ask_skill3();
mixed  ask_skill4();
mixed  ask_skill5();
mixed  ask_skill6();
mixed  ask_skill7();
mixed  ask_skill8();
mixed  ask_skill9();
mixed  ask_skill10();

mixed  try_to_learn_bibo();
mixed  try_to_learn_count();
mixed  try_to_learn_tanzhi();

// 九阴神功pfm
mixed ask_zhi();
mixed ask_shou();
mixed ask_zhang();

void create()
{
        object ob;
        set_name("黄药师", ({"huang yaoshi", "huang", "yaoshi"}));
        set("title", "东海桃花岛岛主");
        set("nickname", HIC "东邪" NOR );
        set("gender", "男性");
        set("age", 42);
        set("long", "他就是桃花岛主。行事好恶全由己心，因此被\n"
                    "人称作「东邪」。\n");
        set("attitude", "peaceful");
        set("class", "scholar");
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        set("qi", 7000);
        set("max_qi", 7000);
        set("jing", 5000);
        set("max_jing", 5000);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 200);
        set("combat_exp", 4000000);

        set_skill("force", 340);
        set_skill("bibo-shengong", 340);
        set_skill("luoying-xinfa", 320);
        set_skill("hand", 320);
        set_skill("finger", 340);
        set_skill("canglang-zhi", 320);
        set_skill("tanzhi-shentong", 340);
        set_skill("unarmed", 320);
        set_skill("strike", 320);
        set_skill("pikong-zhang", 320);
        set_skill("luoying-shenzhang", 320);
        set_skill("xuanfeng-tui", 320);
        set_skill("dodge", 320);
        set_skill("anying-fuxiang", 320);
        set_skill("parry", 320);
        set_skill("sword", 320);
        set_skill("throwing", 340);
        set_skill("luoying-shenjian", 320);
        set_skill("yuxiao-jian", 320);
        set_skill("lanhua-shou", 320);
        set_skill("qimen-wuxing", 350);
        set_skill("count", 350);
        set_skill("jingluo-xue", 350);
        set_skill("mathematics", 350);
        set_skill("literate", 350);
        set_skill("chuixiao-jifa", 400);
        set_skill("bihai-chaosheng", 400);
        set_skill("taohua-yuan", 400);
        set_skill("drawing", 350);
        set_skill("chess", 350);
        set_skill("calligraphy", 350);
        set_skill("medical", 350);
        set_skill("taohua-yaoli", 350);
        set_skill("martial-cognize", 320);

        map_skill("force", "bibo-shengong");
        map_skill("finger", "tanzhi-shentong");
        map_skill("hand", "lanhua-shou");
        map_skill("unarmed", "xuanfeng-tui");
        map_skill("strike", "luoying-shenzhang");
        map_skill("dodge", "anying-fuxiang");
        map_skill("parry", "tanzhi-shentong");
        map_skill("sword", "yuxiao-jian");
        map_skill("chuixiao-jifa", "bihai-chaosheng");
        map_skill("throwing", "tanzhi-shentong");
        map_skill("medical", "taohua-yaoli");

        prepare_skill("finger" , "tanzhi-shentong");

        set("no_teach", ([
                "count"           : (: try_to_learn_count :),
                "bibo-shengong"   : (: try_to_learn_bibo :),
                "tanzhi-shentong" : (: try_to_learn_tanzhi :),
        ]));

        set("inquiry", ([
                "离岛"       : (: ask_leave :),
                "桃花药理"   : (: ask_book1 :),
                "箫谱"       : (: ask_book2 :),
                "旋风扫叶腿" : (: ask_book3 :),
                "河图"       : (: ask_book4 :),
                "洛书"       : (: ask_book4 :),
                "玉箫"       : (: ask_yuxiao :),
                "奇门五转"   : (: ask_skill1 :),
                "兰花拂穴"   : (: ask_skill2 :),
                "影落飞花"   : (: ask_skill3 :),
                "天外清音"   : (: ask_skill4 :),
                "天地情长"   : (: ask_skill5 :),
                "碧海潮生"   : (: ask_skill6 :),
                "定昆仑"     : (: ask_skill7 :),
                "啸沧海"     : (: ask_skill8 :),
                "破九域"     : (: ask_skill9 :),
                "转乾坤"     : (: ask_skill10 :),
                "碧浪滔天"   : "这招你去让冯默风教你吧。",
                "披星戴月"   : "这招你去让陆乘风教你吧。",
                "狂风绝技"   : "这招你去让陆乘风教你吧。",
                "随波逐流"   : "这招你去让曲灵风教你吧。",
                "黄蓉"       : "你敢直称我女儿的闺名？",
                "九阴真经"   : "如果你能帮我取得真经，我一定重重谢你。",
                "九阴神功"   : "九阴神功恢弘正大，乃盖世奇功！",
                "九阴神指"   : (: ask_zhi :),
                "九阴神掌"   : (: ask_zhang :),
                "九阴神手"   : (: ask_shou :),
                "兰花手"     : "兰花拂穴手…唉…可惜我几个弟子都算不得成才！",
                "弹指神通"   : "…唉…我一身绝艺竟然无人可以继承？",
                "玉萧剑法"   : "不是性情中人，如何能够领会这剑法？",
                "碧波神功"   : "…唉…我桃花岛的内功何等厉害，可惜…",
                "九花玉露丸" : "这个东西难制得紧，你好好学学桃花药理，以后自己制吧。",
                "无常丹"     : "…嗯…等你学通了桃花药理的奥妙，自己慢慢制吧。",
        ]));

        create_family("桃花岛", 1, "岛主");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.bihai" :),
		(: perform_action, "sword.qing" :),
		(: perform_action, "sword.tian" :),
		(: perform_action, "finger.ding" :),
		(: perform_action, "finger.xiao" :),
		(: perform_action, "finger.po" :),
		(: perform_action, "finger.zhuan" :),
		(: exert_function, "powerup" :),
		(: exert_function, "recover" :),
	}));
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        if (clonep())
        {
                ob = find_object(YUXIAO);
                if (! ob) ob = load_object(YUXIAO);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        set_temp("handing", ob);
                } else
                {
                        set_temp("handing", carry_object("/d/taohua/obj/huaban"));
                }
        }
        carry_object("/d/taohua/obj/bupao")->wear();
}

void attempt_apprentice(object ob)
{
        string master;
        string *app = ({ "冯默风", "陆乘风", "曲灵风" });

        if (! permit_recruit(ob))
                return;

        if (ob->query_int() < 25)
        {
                command("say 我不收资质差的弟子，您请回吧！");
		return;
        }

        if ((int)ob->query ("shen") < -10000
           || (int)ob->query ("shen") > 10000)
        {
                command("say 我不与成名人物打交道，您请回吧！");
		return;
	}

        if (ob->query("combat_exp") < 400000)
        {
                if (stringp(master = ob->query_temp("taohua/master")))
                {
                        command("say 不是让你和" + master + "学艺吗？你怎么回事？");
                        return;
                }

                if (ob->query("family/family_name") == "桃花岛" &&
                    ob->query("family/master_name") != "黄药师")
                {
                        command("say 你好好跟" + ob->query("family/master_name") +
                                "学艺，水平到了老夫自然会亲自点拨你。");
                        return;
                }

                master = app[random(sizeof(app))];
                
                command("say 嗯…念你长途跋涉赶来拜师，老夫就收你入桃花岛。");
                command("say 不过你武学方面成就有限，还是先跟我弟子" + master + "学习吧。");
                ob->set_temp("taohua/master", master);
                ob->set("family/family_name", "桃花岛");
                return;
        }
        command("say 很好，很好。");
        command("recruit " + ob->query("id"));
}

mixed try_to_learn_count()
{
        object ob = this_player();

        if (ob->query("can_learn/huang/count"))
                return 0;

        if (ob->query_skill("mathematics", 1) >= 200)
        {
                command("nod2");
                command("say 看来你对算术也颇有见解，今日老夫就教"
                        "你些阴阳八卦的知识。");
                ob->set("can_learn/huang/count", 1);
                return 0;
        }
        return "阴阳八卦我不轻易传授。";
}

mixed try_to_learn_bibo()
{
        object ob = this_player();

        if (ob->query("can_learn/huang/bibo-shengong"))
                return 0;

        if (ob->query_skill("bihai-chaosheng", 1) >= 120
	   && ob->query_skill("chuixiao-jifa", 1) >= 120)
        {
                command("sigh");
                command("say 想不到你萧技居然已达此境界，今日老夫"
                        "就传你碧波神功吧。");
                ob->set("can_learn/huang/bibo-shengong", 1);
                return 0;
        }
        return "尔非性情中人，这碧波神功并不适合你。";
}

mixed try_to_learn_tanzhi()
{
        object ob = this_player();

        if (ob->query("can_learn/huang/tanzhi-shentong"))
                return 0;

        if (ob->query_skill("qimen-wuxing", 1) >= 120
	   && ob->query_skill("jingluo-xue", 1) >= 120
	   && ob->query_skill("finger", 1) >= 120
	   && ob->query_skill("throwing", 1) >= 120)
        {
                command("nod2");
                command("say 看来你武功已有了一定的根基，今日老夫"
                        "就传你此套绝技。");
                ob->set("can_learn/huang/tanzhi-shentong", 1);
                return 0;
        }

        return "你此时功力太浅，何以领会弹指神通？";
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/luoying-shenzhang/zhuan"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("luoying-shenzhang", 1) < 1)
                return "你连落英神剑掌都没学，跑来捣什么乱？";

        if (me->query("gongxian") < 350)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 180)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query_skill("qimen-wuxing", 1) < 120)
                return "你对奇门五行的研究不够，这招还学不会。";

        if (me->query_skill("luoying-shenzhang", 1) < 120)
                return "哼！等你把落英神剑掌练熟了再来找我！";

        message_sort(HIY "\n$n" HIY "打量了$N" HIY "一眼，随手攻出一掌。$N" HIY
                     "见来势平平，并不见奇，哪知在作出抵挡的一瞬间才发觉$n" HIY
                     "掌力犹如黄河决堤般汹涌而入，$N" HIY "顿时再也把持不住，被"
                     "那掌力带得接连旋转了数圈，好不容易才停了下来。\n\n" NOR,
                     me, this_object()); 

        command("say 好了，你下去吧。");
        tell_object(me, HIC "你学会了「奇门五转」。\n" NOR);
        if (me->can_improve_skill("qimen-wuxing"))
                me->improve_skill("qimen-wuxing", 1500000);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("luoying-shenzhang"))
                me->improve_skill("luoying-shenzhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/luoying-shenzhang/zhuan", 1);
        me->add("gongxian", -350);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/lanhua-shou/fu"))
                return "自己下去练，罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("lanhua-shou", 1) < 1)
                return "你连兰花拂穴手都没学，跑来捣什么乱？";

        if (me->query("gongxian") < 300)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 160)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query_skill("jingluo-xue", 1) < 120)
                return "你连经络学都没学通，怎么点人穴道？";

        if (me->query_skill("lanhua-shou", 1) < 120)
                return "等你把兰花拂穴手练熟了再来找老夫。";

        message_sort(HIY "\n$n" HIY "微微点了点头，反手轻轻伸出三指，婉转如一朵"
                     "盛开的兰花，对准$N" HIY "的几处穴道虚击数下。\n\n" NOR,
                     me, this_object()); 

        command("say 看懂了么？");
        tell_object(me, HIC "你学会了「兰花拂穴」。\n" NOR);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("lanhua-shou"))
                me->improve_skill("lanhua-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/lanhua-shou/fu", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/lanhua-shou/fei"))
                return "唉…你自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("lanhua-shou", 1) < 1)
                return "你连兰花拂穴手都没学，跑来捣什么乱？";

        if (me->query("gongxian") < 400)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query_skill("lanhua-shou", 1) < 140)
                return "等你把兰花拂穴手练熟了再来找老夫。";

        message_sort(HIY "\n$n" HIY "一声长叹，伸手将$N" HIY "招至他身旁，低声"
                     "在$N" HIY "耳边细说良久。$N" HIY "一边听一边点头，看来对"
                     "$n" HIY "的教导大有所悟。\n\n" NOR, me, this_object()); 

        command("say 唉…你自己下去练吧。");
        tell_object(me, HIC "你学会了「影落飞花」。\n" NOR);
        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("lanhua-shou"))
                me->improve_skill("lanhua-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/lanhua-shou/fei", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/yuxiao-jian/tian"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("yuxiao-jian", 1) < 1)
                return "你连玉箫剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 350)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("bibo-shengong", 1) < 120)
                return "你碧波神功的修为不够，学不了这一招。";

        if (me->query_skill("yuxiao-jian", 1) < 120)
                return "你的玉箫剑法还不够熟练，练高了再来找我。";

        message_sort(HIY "\n$n" HIY "微微点了点头，伸手将$N" HIY "招到面前，在"
                     "$N" HIY "耳边轻声嘀咕了些话。$N" HIY "听了半天，突然间不"
                     "由会心的一笑，看来大有所悟。\n\n" NOR, me, this_object());

        command("nod2");
        command("say 你下去练吧。");
        tell_object(me, HIC "你学会了「天外清音」。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("yuxiao-jian"))
                me->improve_skill("yuxiao-jian", 1500000);
        if (me->can_improve_skill("bibo-shengong"))
                me->improve_skill("bibo-shengong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yuxiao-jian/tian", 1);
        me->add("gongxian", -350);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/yuxiao-jian/qing"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("yuxiao-jian", 1) < 1)
                return "你连玉箫剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query_skill("yuxiao-jian", 1) < 150)
                return "就你这点本事？等你把玉箫剑法练熟了再来找我吧！";

        message_sort(HIY "\n$n" HIY "举头望天，若有所思，随手搭在$N" HIY "的肩"
                     "头，$N" HIY "忽然发现内力源源而逝，不由大惊！\n\n" NOR,
                     me, this_object()); 

        command("sigh");
        command("say 你懂了么？");
        tell_object(me, HIC "你学会了「天地情长」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("yuxiao-jian"))
                me->improve_skill("yuxiao-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yuxiao-jian/qing", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/yuxiao-jian/bihai"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("yuxiao-jian", 1) < 1
	   && me->query_skill("bibo-shengong", 1) < 1
	   && me->query_skill("bihai-chaosheng", 1) < 1)
                return "你玉箫剑法、碧波神功、碧海潮生曲一样都没学，捣什么乱？";

        if (me->query("gongxian") < 1000)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("bibo-shengong", 1) < 180)
                return "你碧波神功的修为不够，学不了这一招。";

        if (me->query_skill("yuxiao-jian", 1) < 180)
                return "你的玉箫剑法还不够熟练，练高了再来找我。";

        if (me->query_skill("bihai-chaosheng", 1) < 180)
                return "你的碧海潮生曲练好了吗？";

        message_sort(HIY "\n$n" HIY "更不答话，单手抚按玉箫，只听得箫声如鸣琴击"
                     "玉，发了几声，接着悠悠扬扬，飘下清亮柔和的洞箫声来。只听那"
                     "洞箫声情致飘忽，缠绵宛转，便似一女子一会儿叹息，一会儿又似"
                     "呻吟，一会儿却又软语温存或柔声叫唤。紧跟着那箫声清亮宛如大"
                     "海浩淼，万里无波，远处潮水缓缓推近，渐近渐快，其后洪涛汹涌"
                     "，白浪连山，而潮水中鱼跃鲸浮，海面上风啸鸥飞，再加上水妖海"
                     "怪，群魔弄潮，忽而冰山飘至，忽而热海如沸，极尽变幻之能事。"
                     "时至最后，却听那箫声愈来愈细，几乎难以听闻，便尤如大海潮退"
                     "后水平如镜一般，但海底却又是暗流湍急，汹涌澎湃。直待$n" HIY
                     "这首碧海潮生曲奏完，却发现$N" HIY "早已陶醉在这箫声之中，完"
                     "全无法自拔。\n\n" NOR, me, this_object()); 

        command("nod");
        command("say 你下去练吧。");
        tell_object(me, HIC "你学会了「碧海潮生按玉箫」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("chuixiao-jifa"))
                me->improve_skill("chuixiao-jifa", 1500000);
        if (me->can_improve_skill("yuxiao-jian"))
                me->improve_skill("yuxiao-jian", 1500000);
        if (me->can_improve_skill("bibo-shengong"))
                me->improve_skill("bibo-shengong", 1500000);
        if (me->can_improve_skill("bihai-chaosheng"))
                me->improve_skill("bihai-chaosheng", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yuxiao-jian/bihai", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();

        if (me->query("can_perform/tanzhi-shentong/ding"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("tanzhi-shentong", 1) < 1)
                return "你连弹指神通都没学，瞎胡闹什么？";

        if (me->query("gongxian") < 450)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 180)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query_skill("jingluo-xue", 1) < 120)
                return "运用这一招需先通晓经络学，你下去练练再来吧。";

        if (me->query_skill("tanzhi-shentong", 1) < 120)
                return "你的弹指神通火候还不够，等你练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "转过头看了$N" HIY "一眼，更不答话，只是轻"
                     "轻伸出两指，合指轻弹，顿时只听“飕”的一声，一缕若有若无"
                     "的罡气已至$n" HIY "指尖射出，朝$N" HIY "电射而去。$N" HIY
                     "顿觉胁下一麻，已被$n" HIY "的指气射中，全身酸软无力，呆立"
                     "当场。\n\n" NOR, me, this_object()); 

        command("say 招式便是如此，你站在这里琢磨一下吧。");
        tell_object(me, HIC "你学会了「定昆仑」。\n" NOR);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("tanzhi-shentong"))
                me->improve_skill("tanzhi-shentong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tanzhi-shentong/ding", 1);
        me->add("gongxian", -450);
        me->start_busy(15);

        return 1;
}

mixed ask_skill8()
{
        object me;

        me = this_player();

        if (me->query("can_perform/tanzhi-shentong/xiao"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("tanzhi-shentong", 1) < 1)
                return "你连弹指神通都没学，瞎胡闹什么？";

        if (me->query("gongxian") < 800)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 280)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query("max_neili") < 3000)
                return "你的内力修为太差，还是练高点再来吧。";

        if (me->query_skill("jingluo-xue", 1) < 200)
                return "运用这一招需先通晓经络学，你下去练练再来吧。";

        if (me->query_skill("tanzhi-shentong", 1) < 200)
                return "你的弹指神通火候还不够，等你练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "一声长叹，伸手将$N" HIY "招至他身旁，低声"
                     "在$N" HIY "耳边细说良久。$N" HIY "一边听一边点头，看来对"
                     "$n" HIY "的教导大有所悟。\n\n" NOR, me, this_object()); 

        command("nod2");
        command("say …嗯…你自己练去吧。");
        tell_object(me, HIC "你学会了「啸沧海」。\n" NOR);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("tanzhi-shentong"))
                me->improve_skill("tanzhi-shentong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tanzhi-shentong/xiao", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill9()
{
        object me;

        me = this_player();

        if (me->query("can_perform/tanzhi-shentong/po"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("tanzhi-shentong", 1) < 1)
                return "你连弹指神通都没学，瞎胡闹什么？";

        if (me->query("gongxian") < 1300)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 250)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query("max_neili") < 2500)
                return "你的内力修为太差，还是练高点再来吧。";

        if (me->query_skill("throwing", 1) < 180)
                return "你的暗器运用还不够娴熟，下去练练再来吧。";

        if (me->query_skill("tanzhi-shentong", 1) < 180)
                return "你的弹指神通火候还不够，等你练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "微微一笑，当下也不作答，随手从身旁桃花树"
                     "上拈下一片花瓣，$N" HIY "正感纳闷，忽闻破空声大作，那片"
                     "花瓣已由$n" HIY "指尖疾弹而出，顿时只听噗嗤一声，已没入"
                     "$N" HIY "身前的青石砖内，石面仅留下一个小孔。\n\n" NOR,
                     me, this_object()); 

        command("haha");
        tell_object(me, HIC "你学会了「破九域」。\n" NOR);
        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("tanzhi-shentong"))
                me->improve_skill("tanzhi-shentong", 1500000);
        if (me->can_improve_skill("tanzhi-shentong"))
                me->improve_skill("tanzhi-shentong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tanzhi-shentong/po", 1);
        me->add("gongxian", -1300);

        return 1;
}

mixed ask_skill10()
{
        object me;

        me = this_player();

        if (me->query("can_perform/tanzhi-shentong/zhuan"))
                return "这一招我不是已经教过你了吗？还罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，打听老夫的武功有何企图？";

        if (me->query_skill("tanzhi-shentong", 1) < 1)
                return "你连弹指神通都没学，瞎胡闹什么？";

        if (me->query("gongxian") < 2200)
                return "你在我桃花岛无所作为，这招老夫暂时还不能传你。";

        if (me->query_skill("force") < 300)
                return "你的内功火候尚需提高，练好了再来吧。";

        if (me->query("max_neili") < 3500)
                return "你的内力修为太差，还是练高点再来吧。";

        if (me->query_skill("qimen-wuxing", 1) < 200)
                return "你对奇门五行的研究不够，这招还学不会。";

        if (me->query_skill("tanzhi-shentong", 1) < 220)
                return "你的弹指神通火候还不够，等你练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "凝视了$N" HIY "半天，方道：“想不到我桃花"
                     "岛居然还有你这等人才，想必日后继承老夫衣钵非你莫属了。”"
                     "$n" HIY "说完哈哈一笑，将$N" HIY "招至身旁，低声细说讲解"
                     "良久，全是$N" HIY "平生从未涉入的境界，$N" HIY "一边听一"
                     "边点头，看来对$n" HIY "的教导大有所悟。\n\n" NOR,
                     me, this_object()); 

        command("haha");
        command("say 能传授的我都已传授了，日后就自己努力吧。");
        tell_object(me, HIC "你学会了「转乾坤」。\n" NOR);
        if (me->can_improve_skill("qimen-wuxing"))
                me->improve_skill("qimen-wuxing", 1500000);
        if (me->can_improve_skill("qimen-wuxing"))
                me->improve_skill("qimen-wuxing", 1500000);
        if (me->can_improve_skill("qimen-wuxing"))
                me->improve_skill("qimen-wuxing", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("tanzhi-shentong"))
                me->improve_skill("tanzhi-shentong", 1500000);
        if (me->can_improve_skill("tanzhi-shentong"))
                me->improve_skill("tanzhi-shentong", 1500000);
        if (me->can_improve_skill("tanzhi-shentong"))
                me->improve_skill("tanzhi-shentong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tanzhi-shentong/zhuan", 1);
        me->add("gongxian", -2200);

        return 1;
}

mixed ask_leave()
{
        object me;

        me = this_player();
        if (me->query("family/family_name") == "桃花岛")
        {
                message_vision(CYN "$N" CYN "对$n" CYN "怒道：你既然入桃花岛"
                               "门下，桃花阵就伤你不得，要离岛自己走到海边去"
                               "！\n" NOR, this_object(), me);
                return 1;
        }

        command("hmm");
        message_vision(HIW "\n$N" HIW "冷哼一声，挥手招来两个哑仆，将$n" HIW
                       "送了出去。\n\n" NOR, this_object(), me);
        me->move("/d/taohua/haitan");
        message_vision(HIW "\n$N" HIW "跟随哑仆来到了海边。\n\n" NOR, me);
        return 1;
}

mixed ask_book1()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "桃花岛")
                return "给我滚开！";

        if (me->query("family/master_id") != query("id"))
                return "只有老夫的弟子才配借读此书。";

        if ((int)me->query_skill("taohua-yaoli", 1) < 60)
                return "你对桃花药理的了解太浅，等你有所领悟后再说。";

        ob = find_object(TAOHUA);
        if (! ob) ob = load_object(TAOHUA);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "那本药理不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…桃花药理现在不在我手里。";

                if (owner->query("family/family_name") == "桃花岛")
                        return "那书现在暂时是你同门" + owner->query("name") +
                               "在看，你要用就去找他吧。";
                else
                        return "桃花药理现在落在了" + owner->query("name") +
                               "手中，你去找他索回吧。";
        }
        ob->move(this_object());
        command("say 这本桃花药理你就拿去看吧，可要认真研读。");
        command("give taohua yaoli to " + me->query("id"));
        return 1;
}

mixed ask_book2()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "桃花岛")
                return "给我滚开！";

        if (me->query("family/master_id") != query("id"))
                return "只有老夫的弟子才配借读此书。";

        if ((int)me->query_skill("chuixiao-jifa", 1) >= 150)
                return "你的箫技到如此地步，那曲谱对你已无多大帮助。";

        ob = find_object(XIAOPU);
        if (! ob) ob = load_object(XIAOPU);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "那本箫谱不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "我的箫谱已经借出去了。";

                if (owner->query("family/family_name") == "桃花岛")
                        return "箫谱现在暂时是你同门" + owner->query("name") +
                               "在看，你要用就去找他吧。";
                else
                        return "老夫的箫谱现在落在了" + owner->query("name") +
                               "手中，你去找他索回吧。";
        }
        ob->move(this_object());
        command("say 这本箫谱你就拿去看吧。");
        command("give xiao pu to " + me->query("id"));
        return 1;
}

mixed ask_book3()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "桃花岛")
                return "给我滚开！";

        if ((int)me->query("combat_exp") < 100000)
                return "你现在的经验太低，还是先多练练基本功。";

        if ((int)me->query_skill("xuanfeng-tui", 1) >= 120)
                return "你旋风扫叶腿的修为已不低，还是自己多练习吧。";

        ob = find_object(XUANFENG);
        if (! ob) ob = load_object(XUANFENG);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "那本秘籍不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "那本扫叶腿法老夫已经借出去了。";

                if (owner->query("family/family_name") == "桃花岛")
                        return "扫叶腿法现在暂时是你同门" + owner->query("name") +
                               "在看，你要用就去找他吧。";
                else
                        return "旋风扫叶腿法现在落在了" + owner->query("name") +
                               "手中，你去找他索回吧。";
        }
        ob->move(this_object());
        command("say 这书你就拿去看吧，有什么不懂可以回来问我。");
        command("give xuanfeng paper to " + me->query("id"));
        return 1;
}

mixed ask_book4()
{
        object me = this_player();

        if (me->query("family/family_name") != "桃花岛"
           && ! me->query("can_learn/huang/count"))
                return "给我滚开！";

        if ((int)me->query("combat_exp") < 1000000)
                return "你现在的经验太低，还是先多练练基本功。";

        if ((int)me->query_skill("count", 1) < 100)
                return "就算给你也读不懂，和我罗嗦什么。";

        me->set_temp("taohua/countbook", 1);
        command("nod");
        command("say 你去找曲灵风吧，这书我让他在保管。");
        return 1;
}

mixed ask_yuxiao()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "桃花岛")
                return "给我滚开！";

        if (me->query("family/master_id") != query("id"))
                return "等你成了老夫的弟子再说。";

        if (me->query_skill("yuxiao-jian", 1) < 150)
                return "你还是先将你的玉萧剑法练练高再说。";

        if (me->query_skill("chuixiao-jifa", 1) < 150)
                return "哼！你连箫都吹不好，拿玉萧又有何用？";

        ob = find_object(YUXIAO);
        if (! ob) ob = load_object(YUXIAO);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "老夫不是把玉萧交给你了吗？还罗嗦什么！";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "玉箫现在不在老夫这里。";

                if (owner->query("family/family_name") == "桃花岛")
                        return "玉箫现在暂时是你同门" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "老夫的玉箫现在落在了" + owner->query("name") +
                               "手中，你去找他索回吧。";
        }
        ob->move(this_object());
        set_temp("handing", carry_object("/d/taohua/obj/huaban"));
        command("say 念你刻苦用功，今日老夫就将玉箫借给你。");
        command("say 行走江湖万事多加小心，可不要丢了老夫的脸。");
        command("give yu xiao to " + me->query("id"));
        return 1;
}

mixed ask_zhi()
{
        object me = this_player();

        if (me->query("can_perform/jiuyin-shengong/zhi"))
                return "你不是已经会了吗？";

        if (! me->query("can_learn/jiuyin-shengong/zhi"))
        {
               tell_object(me, HIG "我与阁下毫无瓜葛，为何有此一问？\n" NOR);
               command("tan");
               return 1;
        }

        if (me->query_skill("jiuyin-shengong", 1) < 250)
        {
               command("shake");
               return "你九阴神功火候不够，我还不能传你这招！";
        }

        if (me->query_skill("finger", 1) < 200)
               return "你基本指法不够娴熟，我不能传你这招！";        
 
        if (me->query_skill("force", 1) < 240)
               return "你内功修为不够，我不能传你这招！";

        if (me->query_skill("martial-cognize", 1) < 240)
               return "你武学修养不够，我不能传你绝招！";

        if (me->query("max_neili") < 5000)
               return "你内力修为不足，我还不能传你绝招！";

        command("haha");
        command("say 既然这样，我就传你绝招，你可看好了！");      
        message_sort(HIM "黄药师出手成指，随意点戳，$N" HIM "只觉指法精妙绝伦，见"
                     "所未见，闻所未闻，霎那间$N" HIM "已眼花缭乱 ……\n" NOR, me);
        
        command("haha");

        command("say 明白了吗？");
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("jiuyin-shengong"))
                me->improve_skill("jiuyin-shengong", 1500000);
        if (me->can_improve_skill("martial-cognize"))
                me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/jiuyin-shengong/zhi", 1);
        tell_object(me, HIG "你学会了「九阴神指」！\n" NOR);
       
        return 1;
}

mixed ask_shou()
{
        object me = this_player();

        if (me->query("can_perform/jiuyin-shengong/shou"))
                return "你不是已经会了吗？";

        if (! me->query("can_learn/jiuyin-shengong/shou"))
        {
               tell_object(me, HIG "我与阁下毫无瓜葛，为何有此一问？\n" NOR);
               command("tan");
               return 1;
        }

        if (me->query_skill("jiuyin-shengong", 1) < 260)
        {
               command("shake");
               return "你九阴神功火候不够，我还不能传你这招！";
        }

        if (me->query_skill("hand", 1) < 200)
               return "你基本手法不够娴熟，我不能传你这招！";        
 
        if (me->query_skill("force", 1) < 240)
               return "你内功修为不够，我不能传你这招！";

        if (me->query_skill("martial-cognize", 1) < 240)
               return "你武学修养不够，我不能传你绝招！";

        if (me->query("max_neili") < 5000)
               return "你内力修为不足，我还不能传你绝招！";

        command("haha");
        command("say 既然这样，我就传你绝招，你可看好了！");      
        message_sort(HIM "黄药师“哈”的一声吐出了一口气，手式奇特，软绵绵的奔向$N"
                     HIM "的要穴！眼见$N" HIM "已无从躲闪，黄药师却突然收招，$N" HIM
                     "惊魂未定，长舒了一口气！\n" NOR, me);
        
        command("haha");

        command("say 明白了吗？");
        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("jiuyin-shengong"))
                me->improve_skill("jiuyin-shengong", 1500000);
        if (me->can_improve_skill("martial-cognize"))
                me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/jiuyin-shengong/shou", 1);
        tell_object(me, HIG "你学会了「九阴神手」！\n" NOR);
       
        return 1;
}

mixed ask_zhang()
{
        object me = this_player();

        if (me->query("can_perform/jiuyin-shengong/zhang"))
                return "你不是已经会了吗？";

        if (! me->query("can_learn/jiuyin-shengong/zhang"))
        {
               tell_object(me, HIG "我与阁下毫无瓜葛，为何有此一问？\n" NOR);
               command("tan");
               return 1;
        }

        if (me->query_skill("jiuyin-shengong", 1) < 260)
        {
               command("shake");
               return "你九阴神功火候不够，我还不能传你这招！";
        }

        if (me->query_skill("strike", 1) < 220)
               return "你基本掌法不够娴熟，我不能传你这招！";        
 
        if (me->query_skill("force", 1) < 240)
               return "你内功修为不够，我不能传你这招！";

        if (me->query_skill("martial-cognize", 1) < 240)
               return "你武学修养不够，我不能传你绝招！";

        if (me->query("max_neili") < 5000)
               return "你内力修为不足，我还不能传你绝招！";

        command("haha");
        command("say 既然这样，我就传你绝招，你可看好了！");      
        message_sort(HIM "双掌一错，幻化出无数掌影，层层叠荡拍向虚空，掌法精妙，气势恢弘，$N"
                     HIM "已看得目瞪口呆！\n" NOR, me);

        
        command("haha");

        command("say 明白了吗？");
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("jiuyin-shengong"))
                me->improve_skill("jiuyin-shengong", 1500000);
        if (me->can_improve_skill("martial-cognize"))
                me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/jiuyin-shengong/zhang", 1);
        tell_object(me, HIG "你学会了「九阴神掌」！\n" NOR);
       
        return 1;
}

int accept_object(object me, object ob) 
{
            int r; 
            if (r = ::accept_object(me, ob)) 
                     return r; 

          if (base_name(ob) != "/clone/lonely/book/zhenjing1")
          
        {
               command("say 你给我这种东西干什么？");               
               return 0;
        } 

        command("heihei");        
        command("say 好吧，既然这样，我就传你九阴神功绝招，你可以随时来问我！"); 
        destruct(ob);
        me->set("can_learn/jiuyin-shengong/zhi", 1);
        me->set("can_learn/jiuyin-shengong/zhang", 1);
        me->set("can_learn/jiuyin-shengong/shou", 1);
 
        return 1;        
}

void unconcious()
{
        die();
}
