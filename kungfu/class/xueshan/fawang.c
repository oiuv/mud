#include <ansi.h>
#include "xueshan.h"

#define JINLUN    "/clone/lonely/jinlun"
#define JIASHA    "/clone/lonely/jiasha"

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
mixed ask_skill10();

mixed ask_lun();
mixed ask_midao();

void create()
{
        object ob1, ob2;
        set_name("金轮法王", ({ "jinlun fawang", "jinlun", "fawang" }));
        set("long", @LONG
他便是大轮寺的护教法王。贵为蒙古国师，极
受成吉思汗重用，常年来随军队征战，扰乱中
原武林，地位显赫尊崇无比。金轮法王踏足中
原后罕逢敌手，藐视中原群雄。其武道之高深
当可谓西域第一人。
LONG);
        set("nickname", HIY "蒙古国师" NOR);
        set("gender", "男性");
        set("class", "bonze");
        set("age", 58);
        set("attitude", "peaceful");
        set("shen_type", -1);

        set("str", 33);
        set("int", 35);
        set("con", 38);
        set("dex", 33);

        set("max_qi", 6500);
        set("max_jing", 5000);
        set("neili", 8000);
        set("max_neili", 8000);
        set("jiali", 220);
        set("combat_exp", 4000000);
        set("score", 500000);

        set_skill("force", 320);
        set_skill("mizong-neigong", 320);
        set_skill("unarmed", 320);
        set_skill("longxiang-gong", 320);
        set_skill("dodge", 300);
        set_skill("shenkong-xing", 300);
        set_skill("hammer", 320);
        set_skill("riyue-lun", 320);
        set_skill("dali-chu", 300);
        set_skill("xiangmo-chu", 300);
        set_skill("sword", 300);
        set_skill("mingwang-jian", 300);
        set_skill("dagger", 280);
        set_skill("finger", 280);
        set_skill("poxu-daxuefa", 280);
        set_skill("hand", 280);
        set_skill("dashou-yin", 280);
        set_skill("cuff", 280);
        set_skill("yujiamu-quan", 280);
        set_skill("parry", 300);
        set_skill("lamaism", 360);
        set_skill("literate", 300);
        set_skill("sanscrit", 300);
        set_skill("martial-cognize", 300);

        map_skill("force", "longxiang-gong");
        map_skill("dodge", "shenkong-xing");
        map_skill("parry", "longxiang-gong");
        map_skill("unarmed", "longxiang-gong");
        map_skill("hammer", "riyue-lun");
        map_skill("dagger", "poxu-daxuefa");
        map_skill("sword", "mingwang-jian");
        map_skill("finger", "poxu-daxuefa");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");

        prepare_skill("unarmed", "longxiang-gong");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hammer.po" :),
                (: perform_action, "hammer.yuan" :),
                (: perform_action, "hammer.lian" :),
                (: perform_action, "unarmed.tun" :),
                (: perform_action, "unarmed.die" :),
                (: perform_action, "unarmed.ji" :),
                (: exert_function, "recover" :),
                (: exert_function, "shield" :),
                (: exert_function, "powerup" :),
        }));

        create_family("大轮寺", 1, "住持");

        set("inquiry", ([
                "日月金轮"  : (: ask_lun :),
                "密道"      : (: ask_midao :),
                "秘道"      : (: ask_midao :),
                "金刚印"    : (: ask_skill1 :),
                "修罗降世"  : (: ask_skill2 :),
                "若悲"      : (: ask_skill3 :),
                "降魔"      : (: ask_skill4 :),
                "破立势"    : (: ask_skill5 :),
                "圆满势"    : (: ask_skill6 :),
                "五轮连转"  : (: ask_skill7 :),
                "龙吞势"    : (: ask_skill8 :),
                "象跌势"    : (: ask_skill9 :),
                "般若极"    : (: ask_skill10 :),
                "真般若极"  : "这是传说中的招式，便是我也未能领悟。",
                "破元通虚"  : "这一招你去让霍都教你好了。",
                "轰雷万钧"  : "这一招你去让达而巴教你好了。",
                "镇魂舞"    : "这一招你去让达而巴教你好了。",
                "龙象袈裟"  : "这是我的随身物品，你打听这个做甚？",
                "金轮九转"  : "我让你去跟唐楠接口，你来跟我说干嘛？",
        ]));

        setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 

        if (clonep())
        {
                ob1 = find_object(JINLUN);
                if (! ob1) ob1 = load_object(JINLUN);
                if (! environment(ob1))
                {
                        ob1->move(this_object());
                        ob1->wield();
                }
        }

        if (clonep())
        {
                ob2 = find_object(JIASHA);
                if (! ob2) ob2 = load_object(JIASHA);
                if (! environment(ob2))
                {
                        ob2->move(this_object());
                        ob2->wear();
                } else
                {
                        ob2 = new("/d/xueshan/obj/p-jiasha");
                        ob2->move(this_object());
                        ob2->wear();
                }
        }
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") != "男性")
        {
                command("say 修习密宗内功需要纯阳之体。");
                command("say 这位" + RANK_D->query_respect(ob) +
                        "还是请回吧！");
                return;
        }

        if ((string)ob->query("class") != "bonze")
        {
                command("say 我佛门的清规戒律甚多。");
                command("say 这位" + RANK_D->query_respect(ob) +
                        "还是请回吧！");
                return;
        }

        if ((int)ob->query("combat_exp") < 450000)
        {
                command("say 你的实战经验不足，还是回去再练练先。");
                return;
        }

        if ((int)ob->query("shen") > -80000)
        {
                command("say 你这人太过心软，成不了什么气候。");
                return;
        }

        if ((int)ob->query_skill("mizong-neigong", 1) < 120)
        {
                command("say 你内功这么差，怎么修行高深的武技？");
                return;
        }

        if ((int)ob->query_skill("lamaism", 1) < 150)
        {
                command("say 入我大轮寺，修习密宗心法是首要的。");
                command("say 这位" + RANK_D->query_respect(ob) +
                        "是否还应该多多钻研本门的心法？");
                return;
        }

        command("nod");
        command("say 念你力求上进，以后就跟着我吧！");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/dashou-yin/yin"))
                return "这招我已经教过你了，自己下去多练习练习吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("dashou-yin", 1) < 1)
                return "你连大手印都没学，还谈什么绝招？";

        if (me->query("gongxian") < 200)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -15000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query_skill("force") < 140)
                return "你的内功修为不足，尚且学不了这一招。";

        if (me->query("max_neili") < 1000)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("dashou-yin", 1) < 100)
                return "等你把大手印练熟了再来找老夫。";

        message_sort(HIY "\n$n" HIY "微微一愣，上下打量了$N" HIY "一番，点"
                     "了点头。当下凝神沉履，面容庄重，双手携着劲风奋力向$N"
                     HIY "面前的一座舍利佛塔拍落，顿时只听得轰然声闷响，佛"
                     "塔内的香灰被$n" HIY "的掌力激荡得四处飞扬，尘烟弥漫"
                     "，待得烟消云散后，$N" HIY "这才发现那座舍利佛塔上豁"
                     "然嵌着一双掌印。\n\n" NOR, me, this_object());

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

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/yujiamu-quan/jiang"))
                return "这招我已经教过你了，自己下去多练习练习吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("yujiamu-quan", 1) < 1)
                return "你连金刚瑜迦母拳都没学，还谈什么绝招？";

        if (me->query("gongxian") < 300)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -18000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query_skill("force") < 150)
                return "你的内功修为不足，尚且学不了这一招。";

        if (me->query("max_neili") < 1200)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("yujiamu-quan", 1) < 100)
                return "等你把金刚瑜迦母拳练熟了再来找老夫。";

        message_sort(HIY "\n$n" HIY "略微点了点头，深深呼入一口气，纵步上"
                     "前，嗔目大喝，拳招迭出，疾如奔雷，霎时已向$N" HIY "攻"
                     "出数拳，招式甚为精妙。实乃$N" HIY "前所未闻。\n\n"
                     NOR, me, this_object());;

        command("nod");
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

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/mingwang-jian/ruo"))
                return "这招我已经教过你了，自己下去多练习练习吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("mingwang-jian", 1) < 1)
                return "你连不动明王剑都没学，还谈什么绝招？";

        if (me->query("gongxian") < 100)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -10000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query_skill("force") < 140)
                return "你的内功修为不足，尚且学不了这一招。";

        if (me->query("max_neili") < 1200)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("mingwang-jian", 1) < 100)
                return "等你把不动明王剑练熟了再来找老夫。";

        message_sort(HIY "\n$n" HIY "微微一笑，也不答话，从$N" HIY "手"
                     "中接过长剑，手腕轻轻一抖，长剑顿时发出一阵低沉的"
                     "轻鸣，鸣音入耳，$N" HIY "只感到心头一震，竟涌上一"
                     "股莫名的悲哀。\n\n" NOR, me, this_object());

        command("haha");
        command("say 这道理很简单，你自己下去练吧。");
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

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/mingwang-jian/xiang"))
                return "这招我已经教过你了，自己下去多练习练习吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("mingwang-jian", 1) < 1)
                return "你连不动明王剑都没学，还谈什么绝招？";

        if (me->query("gongxian") < 400)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -15000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query_skill("force") < 180)
                return "你的内功修为不足，尚且学不了这一招。";

        if (me->query("max_neili") < 1600)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("mingwang-jian", 1) < 140)
                return "等你把不动明王剑练熟了再来找老夫。";

        message_sort(HIY "\n$n" HIY "对$N" HIY "微微一笑，随即伸出右手，中"
                     "食二指并拢，捏作剑诀，“嗤”的一声空点而出，霎时破"
                     "空之声骤响，一股气劲从指尖迸发，将$N" HIY "所穿戴的"
                     "僧袍刺透出一个小孔。\n\n" NOR, me, this_object());

        command("nod");
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

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/riyue-lun/po"))
                return "你又来干什么？自己下去多练。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("riyue-lun", 1) < 1)
                return "你连日月轮法都没学，还谈什么绝招？";

        if (me->query("gongxian") < 800)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -50000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query_skill("longxiang-gong", 1) < 30)
                return "你的龙象般若功修为不足，还学不了这一招。";

        if (me->query_skill("force") < 180)
                return "你的内功修为不足，尚且学不了这一招。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("riyue-lun", 1) < 120)
                return "等你把日月轮法练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "沉思片刻，方才点了点头，伸手将$N" HIY
                     "招至身边，俯身在$P" HIY "耳旁低声细说良久，$N" HIY
                     "听后不禁会心的一笑，似乎对$n" HIY "的教导大有所悟"
                     "。\n\n" NOR, me, this_object());

        command("grin");
        command("say 把我刚才说的记牢，自己下去练吧。");
        tell_object(me, HIC "你学会了「破立势」。\n" NOR);

        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("riyue-lun"))
                me->improve_skill("riyue-lun", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/riyue-lun/po", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/riyue-lun/yuan"))
                return "你又来干什么？自己下去多练。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("riyue-lun", 1) < 1)
                return "你连日月轮法都没学，还谈什么绝招？";

        if (me->query("gongxian") < 800)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -50000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query_skill("longxiang-gong", 1) < 30)
                return "你的龙象般若功修为不足，还学不了这一招。";

        if (me->query_skill("force") < 180)
                return "你的内功修为不足，尚且学不了这一招。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("riyue-lun", 1) < 120)
                return "等你把日月轮法练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "沉思片刻，方才点了点头，伸手将$N" HIY
                     "招至身边，俯身在$P" HIY "耳旁低声细说良久，$N" HIY
                     "听后不禁会心的一笑，似乎对$n" HIY "的教导大有所悟"
                     "。\n\n" NOR, me, this_object());

        command("nod");
        command("say 虽然这招可使自身不受伤害，但却会减弱攻势。");
        tell_object(me, HIC "你学会了「圆满势」。\n" NOR);

        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("riyue-lun"))
                me->improve_skill("riyue-lun", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/riyue-lun/yuan", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();

        if (me->query("can_perform/riyue-lun/lian"))
                return "你又来干什么？自己下去多练。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("riyue-lun", 1) < 1)
                return "你连日月轮法都没学，还谈什么绝招？";

        if (me->query("gongxian") < 2000)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -80000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query_skill("force") < 250)
                return "你的内功修为不足，尚且学不了这一招。";

        if (me->query("max_neili") < 3000)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("riyue-lun", 1) < 150)
                return "等你把日月轮法练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "凝视了$N" HIY "半天，才颇为赞许的点"
                     "了点头，说道：“你能有此实力也属不易，今日为师就"
                     "传你这招，瞧仔细了！”说罢$n" HIY "便取出日月金轮"
                     "，嗔目大喝，单手陡然一振，蓦地将日月金轮飞掷而出"
                     "，幻作数道光芒，相互盘旋着压向$N" HIY "，招术当真"
                     "精奇之极！\n\n" NOR, me, this_object());

        command("haha");
        command("say 这招倘若是配合我的日月金轮施展，更能见有神效。");
        tell_object(me, HIC "你学会了「五轮连转」。\n" NOR);

        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("riyue-lun"))
                me->improve_skill("riyue-lun", 1500000);
        if (me->can_improve_skill("riyue-lun"))
                me->improve_skill("riyue-lun", 1500000);
        if (me->can_improve_skill("riyue-lun"))
                me->improve_skill("riyue-lun", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/riyue-lun/lian", 1);
        me->add("gongxian", -2000);

        return 1;
}

mixed ask_skill8()
{
        object me;

        me = this_player();

        if (me->query("can_perform/longxiang-gong/tun"))
                return "我不是已经教过你了么？还罗嗦什么。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("longxiang-gong", 1) < 1)
                return "你连龙象般若功都没学，还谈什么绝招？";

        if (me->query("gongxian") < 1800)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -80000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query("max_neili") < 3000)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("longxiang-gong", 1) < 180)
                return "你的龙象般若功修为不足，练练再来吧。";

        message_sort(HIY "\n$n" HIY "沉思片刻，方才点了点头，伸手将$N" HIY
                     "招至身边，俯身在$P" HIY "耳旁低声细说良久，$N" HIY
                     "听后不禁会心的一笑，似乎对$n" HIY "的教导大有所悟"
                     "。\n\n" NOR, me, this_object());

        command("nod");
        command("say 刚才我说的全是这招的精髓，自己下去领悟吧。");
        tell_object(me, HIC "你学会了「龙吞势」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("longxiang-gong"))
                me->improve_skill("longxiang-gong", 1500000);
        if (me->can_improve_skill("longxiang-gong"))
                me->improve_skill("longxiang-gong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/longxiang-gong/tun", 1);
        me->add("gongxian", -1800);

        return 1;
}

mixed ask_skill9()
{
        object me;

        me = this_player();

        if (me->query("can_perform/longxiang-gong/die"))
                return "我不是已经教过你了么？还罗嗦什么。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("longxiang-gong", 1) < 1)
                return "你连龙象般若功都没学，还谈什么绝招？";

        if (me->query("gongxian") < 2200)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -120000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query("max_neili") < 4000)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("longxiang-gong", 1) < 240)
                return "你的龙象般若功修为不足，练练再来吧。";

        message_sort(HIY "\n$n" HIY "看了$N" HIY "一眼，当下也不答话，陡"
                     "然伸出右手，往$N" HIY "胸口探去。$N" HIY "慌忙招"
                     "架，却哪知这看似不经意的一掌，竟然暗含了龙象般若"
                     "功第八成的功力，$N" HIY "根本无暇躲避，顿时被这招"
                     "所制，重重的摔了出去。\n\n" NOR, me, this_object());

        command("say 懂了么？");
        tell_object(me, HIC "你学会了「象跌势」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("longxiang-gong"))
                me->improve_skill("longxiang-gong", 1500000);
        if (me->can_improve_skill("longxiang-gong"))
                me->improve_skill("longxiang-gong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/longxiang-gong/die", 1);
        me->add("gongxian", -2200);

        return 1;
}

mixed ask_skill10()
{
        object me;

        me = this_player();

        if (me->query("can_perform/longxiang-gong/ji"))
                return "我不是已经教过你了么？还罗嗦什么。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫僧素无渊源，不知此话从何谈起？";

        if (me->query_skill("longxiang-gong", 1) < 1)
                return "你连龙象般若功都没学，还谈什么绝招？";

        if (me->query("gongxian") < 2500)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -160000)
                return "你为人太过心软，这一招你不学也罢。";

        if (me->query("max_neili") < 5000)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("longxiang-gong", 1) < 300)
                return "你的龙象般若功修为不足，练练再来吧。";

        message_sort(HIY "\n$n" HIY "微微点了点头，只是随手搭在$N" HIY
                     "的肩上，突然$N" HIY "陡觉全身筋脉剧震，内息澎湃"
                     "汹涌之极，犹如江河绝堤，便欲冲关破出一般，不由大"
                     "惊。\n\n" NOR, me, this_object());

        command("haha");
        command("say 刚才我这一招，你看明白了多少？");
        tell_object(me, HIC "你学会了「般若极」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("longxiang-gong"))
                me->improve_skill("longxiang-gong", 1500000);
        if (me->can_improve_skill("longxiang-gong"))
                me->improve_skill("longxiang-gong", 1500000);
        if (me->can_improve_skill("longxiang-gong"))
                me->improve_skill("longxiang-gong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/longxiang-gong/ji", 1);
        me->add("gongxian", -2500);

        return 1;
}

mixed ask_midao()
{
        object me;

        me = this_player();
        if (me->query("family/family_name") != "大轮寺")
                return "你找死么？";

        command("whisper " + me->query("id") + " 你既然投入我大轮寺，以"
                "后若\n要去中原办事，即可用我大轮寺先辈们留下的密道，直"
                "接去禅\n室转动(" HIY "turn lunpan" NOR + WHT ") 轮盘触"
                "发机关，地面便会开启密道，然\n后你顺着密道前进便能到达"
                "中原扬州。若要回寺可找我大轮寺\n伏在中原的唐楠，接口的"
                "密语是" HIY "金轮九转" NOR + WHT "，可记清楚了。\n");
        return "此秘密不可泄露于他人，否则我饶不了你！";
}

mixed ask_lun()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_good())
        {
                if (me->query("family/family_name") == "大轮寺")
                        message_vision(CYN "$N" CYN "大怒，对$n" CYN "道：“你身"
                                       "为我大轮寺弟子，反而学起假仁假义来了，给"
                                       "我滚吧！”\n" NOR, this_object(), me);
                else
                        message_vision(CYN "$N" CYN "大怒，对$n" CYN "喝道：“你"
                                       "是什么人？居然敢贪图我的随身利器，活得不"
                                       "耐烦了？”\n" NOR, this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") != "大轮寺")
                return "日月金轮是我的随身兵器，你打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才配使用金轮，你还是自己下去练练吧。";

        if (me->query("shen") > -50000)
                return "哼！你既然如此侠义，还是别用金轮的好。";

        ob = find_object(JINLUN);
        if (! ob) ob = load_object(JINLUN);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "怎么？日月金轮不就是你拿着在用吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，日月金轮现在不在我手中。";

                if (owner->query("family/family_name") == "大轮寺")
                        return "金轮现在暂时是你同门师兄" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "我的日月金轮现在落在" + owner->query("name") +
                               "手中，你去把他做了，把金轮抢回来！";
        }

        ob->move(this_object());
        message_vision(CYN "$N" CYN "微微笑道：念在你平时刻苦努力，我这柄"
                       "金轮你就拿去用吧。\n" NOR, this_object(), me);
        command("give riyue jinlun to " + me->query("id"));
        return 1;
}

void unconcious()
{
        die();
}
