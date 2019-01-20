#include <ansi.h>
#include "meizhuang.h"

#define YAOQIN    "/clone/lonely/yaoqin"
#define DONGXIAO  "/clone/lonely/dongxiao"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_xiao();
mixed ask_qin();

void create()
{
        object ob;
        set_name("黄钟公", ({ "huangzhong gong", "huang", "zhong", "huangzhong", "gong" }));
        set("long", @LONG
这就是梅庄四位庄主排行第一的黄钟公。只见
他身穿一件干干净净的黄色长袍。虽然已年愈
六旬，但依然精神抖擞。他身材中等，面容和
蔼可亲。
LONG);
        set("title", "梅庄大庄主");
        set("nickname", HIR "梅庄四友" NOR);
        set("gender", "男性");
        set("age", 62);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 38);
        set("int", 38);
        set("con", 38);
        set("dex", 38);

        set("max_qi", 6000);
        set("max_jing", 5000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 200);
        set("combat_exp", 2500000);

        set_skill("force", 260);
        set_skill("wuzheng-xinfa", 240);
        set_skill("xuantian-wujigong", 260);
        set_skill("dodge", 260);
        set_skill("meihua-zhuang", 260);
        set_skill("parry", 260);
        set_skill("sword", 260);
        set_skill("unarmed", 260);
        set_skill("qixian-wuxingjian", 260);
        set_skill("cuff", 240);
        set_skill("zuiquan-sanda", 240);
        set_skill("claw", 200);
        set_skill("longzhua-gong", 200);
        set_skill("strike", 240);
        set_skill("qingmang-zhang", 240);
        set_skill("literate", 240);
        set_skill("buddhism", 150);
        set_skill("tanqin-jifa", 400);
        set_skill("guangling-san", 400);
        set_skill("qingxin-pushan", 400);
        set_skill("martial-cognize", 240);

        set("no_teach", ([
                "longzhua-gong"  : "龙爪功乃昔日方证大师所授的少林"
                                   "绝学，老夫略之一二，并不授教。",
        ]));

        map_skill("force", "xuantian-wujigong");
        map_skill("dodge", "meihua-zhuang");
        map_skill("parry", "qixian-wuxingjian");
        map_skill("sword", "qixian-wuxingjian");
        map_skill("unarmed", "qixian-wuxingjian");
        map_skill("strike", "qingmang-zhang");
        map_skill("cuff", "zuiquan-sanda");
        map_skill("claw", "longzhua-gong");
        map_skill("tanqin-jifa", "guangling-san");

        prepare_skill("unarmed", "qixian-wuxingjian");

        create_family("梅庄", 1, "庄主");

        set("inquiry", ([
                "绝招"        : "你要问什么绝招？",
                "绝技"        : "你要问什么绝技？",
                "任我行"      : "任我行乃日月神教上代教主，不过已经失踪很久了。",
                "东方不败"    : "东方教主武功深不可测，天下无敌。",
                "日月神教"    : "我们梅庄四友和日月神教已无瓜葛，你提它作甚？",
                "广陵散"      : "唉，传说现在《广陵散琴谱》竟已现世，不知是真是假。",
                "七弦无形音"  : (: ask_skill1 :),
                "七弦黄龙闪"  : (: ask_skill2 :),
                "七弦连环诛"  : (: ask_skill3 :),
                "绿玉洞箫"    : (: ask_xiao :),
                "白玉瑶琴"    : (: ask_qin :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.yin" :),
                (: perform_action, "sword.shan" :),
                (: perform_action, "sword.zhu" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }) );

        setup();

        if (clonep())
        {
                ob = find_object(YAOQIN);
                if (! ob) ob = load_object(YAOQIN);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/d/meizhuang/obj/qin");
                        ob->move(this_object());
                        ob->wield();
                }
        }
        carry_object("/d/quanzhen/npc/obj/greenrobe")->wear();
}

void attempt_apprentice(object me)
{
        // string purename, name, new_name;

        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "日月神教" &&
             me->query("family/master_name") == "东方不败" )
        {
                command("hmm");
                command("say 原来是东方教主的弟子，收你…这个倒没什么问题。");
                command("say 但是在收你之前，我得先考察一下你的能力。");
                me->set("move_party/日月神教—梅庄", 1);
        }

        if ((int)me->query("combat_exp") < 400000)
        {
                command("sigh");
                command("say 你的江湖经验太浅，还是先多锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("force") < 180)
        {
                command("say 学我七弦无形剑，内功非精纯不可，你还是先多练练吧。");
                return;
        }

        if ((int)me->query_skill("sword", 1) < 100)
        {
                command("say 如要学我七弦无形剑，你还得在剑法上多下工夫。");
                return;
        }

        if ((int)me->query_skill("unarmed", 1) < 100)
        {
                command("say 如要学我七弦无形剑，你还得在拳脚上多下工夫。");
                return;
        }

        command("say 不错，不错！");
        command("say 我就收下你了，不过千万别招惹是非，给我梅庄添乱。");
        command("recruit " + me->query("id"));

        if (me->query("move_party/日月神教—梅庄"))
        {
                me->delete("move_party/日月神教—梅庄", 1);
                command("say 现在你成为我梅庄中人，望你专心练武，别再去过问教中事物。");
        }
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qixian-wuxingjian/yin"))
                return "你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("qixian-wuxingjian", 1) < 1)
                return "你连七弦无形剑都没学，何谈此言？";

        if (me->query("gongxian") < 500)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 250)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("qixian-wuxingjian", 1) < 160)
                return "你的七弦无形剑还练得不到家，自己下去练练再来吧。";

        if (me->query_skill("tanqin-jifa", 1) < 120)
                return "你的琴技还不够娴熟，运用不了这一招。";

        message_vision(HIY "$n" HIY "微微一笑，转身从书架上取出一本"
                       "琴谱，指着其中一段对$N" HIY "细说\n良久，$N"
                       HIY "一边听一边点头。\n" NOR, me, this_object());
        command("nod");
        command("say 这便是七弦无形音的奥义所在，你可明白了？");
        tell_object(me, HIC "你学会了「七弦无形音」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("qixian-wuxingjian"))
                me->improve_skill("qixian-wuxingjian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qixian-wuxingjian/yin", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qixian-wuxingjian/shan"))
                return "你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("qixian-wuxingjian", 1) < 1)
                return "你连七弦无形剑都没学，何谈此言？";

        if (me->query("gongxian") < 500)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 250)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("qixian-wuxingjian", 1) < 160)
                return "你的七弦无形剑还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("tanqin-jifa", 1) < 120)
                return "你的琴技还不够娴熟，运用不了这一招。";

        message_vision(HIY "$n" HIY "点了点头，将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "听"
                       "后会心的\n一笑，看来大有所悟。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 刚才我所说的便是七弦黄龙闪的精要，你可记清了？");
        tell_object(me, HIC "你学会了「七弦黄龙闪」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("qixian-wuxingjian"))
                me->improve_skill("qixian-wuxingjian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qixian-wuxingjian/shan", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qixian-wuxingjian/zhu"))
                return "能教的我已经都教了，你自己下去多多练习吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("qixian-wuxingjian", 1) < 1)
                return "你连七弦无形剑都没学，何谈此言？";

        if (me->query("gongxian") < 2000)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 300)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("qixian-wuxingjian", 1) < 180)
                return "你的七弦无形剑还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("tanqin-jifa", 1) < 150)
                return "你的琴技还不够娴熟，运用不了这一招。";

        message_vision( HIW "$n" HIW "微微一笑，也不答话，转身怀抱手中"
                       "瑶琴，放至身前，轻轻拂弄。顿时琴声\n四起，时缓"
                       "时急，忽尔悄然无声，忽尔铮然大响，过了一会，琴"
                       "声越弹越急。$N" HIW "只\n听得心神不定，呼吸不舒"
                       "，便在此时，琴音铮铮大响，琴音响一声，$N" HIW
                       "便退出一步，\n琴音连响五下，便不由自主的退了五"
                       "步。$N" HIW "脸色雪白，定了定神，才道：“师父这"
                       "\n无形剑法当真厉害。这六音连续狠打猛击，江湖中"
                       "又有谁能抵受得了？”$n" HIW "听\n后哈哈一笑。\n"
                       NOR, me, this_object());
        command("haha");
        command("say 这招便是「六丁开山」神技，又称七弦连环诛，你看明白了多少？");
        tell_object(me, HIC "你学会了「七弦连环诛」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("qixian-wuxingjian"))
                me->improve_skill("qixian-wuxingjian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qixian-wuxingjian/zhu", 1);
        me->add("gongxian", -2000);

        return 1;
}

mixed ask_xiao()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "梅庄")
                return "你和本庄素无渊源，打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才配使用这绿玉洞箫。";

        ob = find_object(DONGXIAO);
        if (! ob) ob = load_object(DONGXIAO);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "现在这绿玉洞箫不正是你拿着吗，为何无故来消遣老夫？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，我已经把这绿玉洞箫借给你同门师兄用去了。";

                if (owner->query("family/family_name") == "梅庄")
                        return "绿玉洞箫现在暂时是你同门" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "我的绿玉洞箫现在落在了" + owner->query("name") +
                               "手中，你去把它找回来吧！";
        }

        ob->move(this_object());
        message_vision(HIC "$N" HIC "微微一笑，道：“好，我这就将我珍藏已久的绿玉洞箫借给"
                       "你。”\n" NOR, this_object(), me);
        command("give lvyu dongxiao to " + me->query("id"));
        return 1;
}

mixed ask_qin()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("family/family_name") != "梅庄")
                return "你和本庄素无渊源，打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才配使用这白玉瑶琴。";

        if (me->query_skill("qixian-wuxingjian", 1) < 150)
                return "你还是下去将你的七弦无形剑练练再来吧。";

        if (me->query_skill("tanqin-jifa", 1) < 150)
                return "你连琴都弹不好，干嘛还要用我这白玉瑶琴？";

        if (present("baiyu yaoqin", me))
                return "现在白玉瑶琴不就在你身上吗，为何无故来消遣老夫？";

        ob = present("baiyu yaoqin", this_object());

        if (! objectp(ob))
                return "现在白玉瑶琴已经不在我这里了。";

        ob->move(this_object());
        command("give baiyu yaoqin to " + me->query("id"));

        ob = new("/d/meizhuang/obj/qin");
        ob->move(this_object());
        ob->wield();

        return "很好，既然这样，我这白玉瑶琴你就暂时拿去用吧。";
}

int accept_object(object me, object ob)
{
        if (base_name(ob) != DONGXIAO
           && base_name(ob) != YAOQIN)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query("family/master_id") != query("id"))
                command("say 多谢这位" + RANK_D->query_respect(me) +
                        "将我的宝贝交回。");
        else
                command("say 很好，很好！");
        destruct(ob);
        return 1;
}
