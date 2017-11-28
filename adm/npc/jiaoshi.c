// jiaoshi.c 教士

#include <ansi.h>

#define MARRY_RING      "/clone/misc/wedding-ring.c"
#define RING_DIR        "/data/item/ring/"

inherit NPC;

void create()
{
	set_name("西洋传教士", ({ "jiao shi", "jiaoshi", "marriage witness" }));
	set("long", 
		"他穿着一身的黑色服饰，神色肃穆。\n");
	set("gender", "男性");
	set("age", 35);
	set("combat_exp", 1000);

        set("inquiry", ([
                "结婚": "要结婚是吗？大家都是上帝的子女，我可以为你们证婚。",
                "离婚": "虽然离婚让人感到痛苦，但是也许凑在一起更让人痛苦！",
        ]));

	setup();
        seteuid(getuid());
}

int do_witness(object me, object ob)
{
        message_vision("$N含情脉脉的望着$n，真是柔情似水，过了良久才对" +
                       name() + "道：这位先生做我们的证婚人吧！\n\n",
                       me, ob);

        if (! living(ob))
        {
                message_vision(name() + "目瞪口呆了半点才对$N道：我"
                               "看你还是先把这位弄醒再说吧。\n", me);
                return 1;
        }

        if (! userp(ob))
        {
                message_vision(name() + "满脸都是苦笑，笑啥"
                               "呢？你也呵呵的跟着傻笑。\n", me);
                return 1;
        }

        message_vision(name() + "点点头道：“很好，很好！大家都是"
                       "上帝的子女，这个没有问题。问题是你们都是两相情愿吗？”\n"
                       "说罢转过头来，对$n问道：“你愿意和" +
                       (me->query("gender") == "女性" ? "她" : "他") +
                       "结为夫妻吗(right/refuse)？”\n", me, ob);

	ob->set_temp("pending/answer/" + me->query("id") + "/right",
                     bind((: call_other, __FILE__, "do_right", ob, me :), ob));
	ob->set_temp("pending/answer/" + me->query("id") + "/refuse",
	             bind((: call_other, __FILE__, "do_refuse", ob, me :), ob));
	me->set_temp("pending/engage", ob);
        return 1;
}

int do_right(object me, object ob)
{
        string fn;
        string fc;
        object ring;

        message_vision("$N看了看$n，点头道：“我愿意！”\n", me, ob);
        command("chat 很好，我现在宣布：" + me->name(1) + "和" + ob->name(1) +
                "已经成为合法的夫妻了！");
        message("visoin", name() + "笑着对二人说：“这对结婚"
                "戒指送给你们，就算是我的礼物吧！”\n\n", environment(me));

        fc = read_file(MARRY_RING);
        fc = replace_string(fc, "LONG_DESCRIPTION",
                            "这是" + me->name(1) + "和" +
                            ob->name(1) + "的结婚戒指，是两人的定情之物。\n");

        // give ring to me
        fn = RING_DIR + me->query("id");
        if (file_size(fn + ".c") > 0)
        {
                if (ring = find_object(fn)) destruct(ring);
                rm(fn + ".c");
        }
        assure_file(fn);
        write_file(fn + ".c", fc);
        VERSION_D->append_sn(fn + ".c");
        ring = load_object(fn);
        ring->move(me, 1);
        tell_object(me, HIY "你获得了一个结婚戒指。\n" NOR);
        me->set("can_summon/" + "wedding ring", fn);

        // give ring to ob
        fn = RING_DIR + ob->query("id");
        if (file_size(fn + ".c") > 0)
        {
                if (ring = find_object(fn)) destruct(ring);
                rm(fn + ".c");
        }
        assure_file(fn);
        write_file(fn + ".c", fc);
        VERSION_D->append_sn(fn + ".c");
        ring = load_object(fn);
        ring->move(ob, 1);
        tell_object(ob, HIY "你获得了一个结婚戒指。\n" NOR);
        ob->set("can_summon/" + "wedding ring", fn);
        
        // record
	me->set("couple/id", ob->query("id"));
	me->set("couple/name", ob->name(1));
        me->set("couple/witness", name());
	me->save();
	ob->set("couple/id", me->query("id"));
	ob->set("couple/name", me->name(1));
        ob->set("couple/witness", name());
	ob->save();
        return 1;
}

int do_refuse(object me, object ob)
{
        message_vision("$N瞥了$n一眼，转过头去不再看，连吐了"
                       "几口，“呸、呸、我呸呸呸！”\n" +
                       name() + "无奈的对$n道：“一厢情愿是不行的，"
                       "那是犯罪...你还是算了吧。”\n", me, ob);
        return 1;
}

int do_divorce(object me)
{
        object ob;

        if (me->query("couple/witness") != name())
        {
                message_vision(name() + "摇摇头，对$N道：“我"
                               "不是你们的证婚人，你们离婚不要找我！”\n", me);
                return 1;
        }

        ob = find_player(me->query("couple/id"));
        if (! ob || environment(ob) != environment(me))
        {
                message_vision(name() + "吃惊的看着$N道：“怎么，要离婚？"
                               "不过要离你怎么也得把人家找来啊！”\n", me);
                return 1;
        }

        if (! living(ob))
        {
                message_vision(name() + "摇摇头，对$N道：“我说这位" +
                               RANK_D->query_respect(me) +
                               "，怎么也得等人家醒过来再说吧！”\n", me);
                return 1;
        }

        if (me->query_temp("pending/submit_divorce"))
        {
                message_vision(name() + "摇摇头，对$N道：“你着"
                               "什么急，也不看看人家的意思？”\n",
                               me);
                return 1;
        }

        if (! ob->query_temp("pending/submit_divorce"))
        {
                message_vision(name() + "叹了口气，回头看了看$n，问道：“你"
                               "决定要和" + ob->name() + "离婚吗？”\n\n", me, ob);
                tell_object(ob, YEL + name() + "悄悄的告诉你：要是那样，你就输入("
                                "divorce " + me->query("id") + ")表示决心已定。\n");
                me->set_temp("pending/submit_divorce", 1);
                return 1;
        }

        message_vision(name() + "慢慢的对$N和$n道：“既然你们双方"
                       "已经不愿意在一起了，那就分开吧！”\n\n", me, ob);
        command("chat 从今天起" + me->name(1) + "和" + ob->name(1) +
                "不再是夫妻了，他们以后没有什么关系了！");
        UPDATE_D->clear_user_data(me->query("id"), "couple");
        return 1;
}

int accept_fight(object who)
{
        command("shake");
        command("say 我来中国不是打架来的，如果你有兴趣可以找我们的大力士。");
        return notify_fail("你还是算了吧！\n");
}

int accept_hit(object who)
{
        command("fear");
        command("say 你怎么能随便打人？");
        return notify_fail("你还是算了吧！\n");
}

int accept_kill(object who)
{
        command("say 中国人好野蛮啊！你怎么能这样？");
        return 1;
}

void unconcious()
{
        die();
}

void die()
{
        command("chat 中国人真野蛮！走了走了。");
        message_vision("$N急忙溜走了。\n", this_object());
        destruct(this_object());
}
