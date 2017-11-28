// hongniang.c 红娘

#include <ansi.h>

#define MARRY_RING      "/clone/misc/wedding-ring.c"
#define RING_DIR        "/data/item/ring/"

inherit NPC;

void create()
{
	set_name("红娘", ({ "hong niang", "hongniang", "marriage witness" }));
	set("long", 
		"她是一个长得很好看的小姑娘，忽闪忽"
                "闪的大眼睛透着一丝狡黠。\n");
	set("gender", "女性");
	set("age", 18);
	set("combat_exp", 1000);

        set("inquiry", ([
                "结婚": "要结婚？我可以为你们做媒啊，你们人都来齐了么？",
                "离婚": "结婚找我，离婚我也帮忙，不过可以慎重哦。一日夫妻百日恩嘛！",
        ]));

	setup();
        seteuid(getuid());
}

int do_witness(object me, object ob)
{
        message_vision("$N含情脉脉的望着$n，真是柔情似水，过了良久才对" +
                       name() + "道：这位小姑娘能否为我们证婚？\n\n",
                       me, ob);

        if (! living(ob))
        {
                message_vision(name() + "吃吃的掩嘴而笑，对$N道：我"
                               "看你还是先把这位弄醒再说吧。\n", me);
                return 1;
        }

        if (! userp(ob))
        {
                message_vision(name() + "满脸都是苦笑，笑啥"
                               "呢？你也呵呵的跟着傻笑。\n", me);
                return 1;
        }

        message_vision(name() + "大声喊道：“很好啊，好得很！俗"
                       "话说：“在天愿为比翼鸟，在地愿成连理枝。”\n" +
                       "促成良缘是天大的美事！我" + name() + "最愿意了，问题是这位" +
                       RANK_D->query_respect(ob) + "也愿意吗？”\n\n", me);

	tell_object(ob, YEL + name() + "悄声问你：" + me->name(1) +
                        "在向你求婚呢，你答应(right)还是不答应(refuse)？\n" NOR);
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

        message_vision("$N偷偷看了看$n，使劲的点头道：我愿意，愿意极了！\n" + name() +
                       "听了，笑嘻嘻道：“两厢情愿，又有我这媒人，那还不好办吗？”\n\n",
                       me, ob);
        command("chat 恭喜" + me->name(1) + "和" + ob->name(1) +
                "成为百年之好！");
        message("visoin", name() + "笑着对二人说：“今个儿是你们"
                "大喜的日子，我没有什么礼物，只好送给你"
                "们这对新人一对结婚戒指吧！”\n\n", environment(me));

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
                       name() + "无奈的对$n道：“你也看到了，"
                       "俗话说强扭的瓜不甜啊...”\n", me, ob);
        return 1;
}

int do_divorce(object me)
{
        object ob;

        if (me->query("couple/witness") != name())
        {
                message_vision(name() + "摇摇头，对$N道：“我可"
                               "不是你们的媒人，你们要离就离，别来烦我！”\n", me);
                return 1;
        }

        ob = find_player(me->query("couple/id"));
        if (! ob || environment(ob) != environment(me))
        {
                message_vision(name() + "吃惊的看着$N道：“怎么，吵"
                               "架了？唉，花无百日好啊！不过要离你怎"
                               "么也得把人家找来一起谈谈啊！”\n", me);
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
                message_vision(name() + "轻轻叹了口气，一张幼稚的脸上也"
                               "不禁有些沧桑，回头看了看$n，问道：“你"
                               "也是铁了心不和" + ob->name() + "过了？”\n\n", me, ob);
                tell_object(ob, YEL + name() + "悄悄的告诉你：要是那样，你就输入("
                                "divorce " + me->query("id") + ")表示决心已定。\n");
                me->set_temp("pending/submit_divorce", 1);
                return 1;
        }

        message_vision(name() + "痛心的对$N和$n道：“当初我为你们"
                       "两个做媒的时候，可真没想到会有这么一天！”\n\n", me, ob);
        command("chat 从今天起" + me->name(1) + "和" + ob->name(1) +
                "分手了，以后可就各走各的路啦！");
        UPDATE_D->clear_user_data(me->query("id"), "couple");
        return 1;
}

int accept_fight(object who)
{
        command("fear");
        command("say 别来，我好怕怕的。");
        return notify_fail("你还是算了吧！\n");
}

int accept_hit(object who)
{
        command("say 不要啊！不要乱动手！");
        return notify_fail("你还是算了吧！\n");
}

int accept_kill(object who)
{
        command("say 呀！你想干什么？");
        return 1;
}

void unconcious()
{
        die();
}

void die()
{
        command("chat 不好了！出人命了！");
        message_vision("$N飞也似的逃走了。\n", this_object());
        destruct(this_object());
}
