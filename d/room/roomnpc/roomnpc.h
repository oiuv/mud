// major function of room's npc

int is_owner(object ob)
{
        if (ob->query("id") == environment()->query("room_owner_id") ||
            ob->query("couple/id") == environment()->query("room_owner_id"))
                return 1;

        return 0;
}

int is_owner_permit(object ob)
{
        if (ob->query_temp("permit_enter/" + environment()->query("room_owner_id")))
                return 1;

        if (objectp(present(environment()->query("room_owner_id") + " pass", ob)))
                return 1;

        return 0;
}

int owner_is_present()
{
        string id;

        if (present(id = environment()->query("room_owner_id")))
                return 1;

        return 0;
}

int do_invite(string arg)
{
        object ob;
        object me;

        if (! arg || ! objectp(ob = present(arg, environment())))
                return notify_fail("你要邀请谁？\n");

        if (! ob->is_character())
                return notify_fail("你向邀请它，可是它不会走路啊！\n");

        if (! ob->query("can_speak"))
                return notify_fail("有意思，不过你最好还是邀请一个“人”。\n");

        if (ob == me)
                return notify_fail("你要邀请你自己？想法不错，可惜没有用。\n");

        if (is_owner(ob))
                return notify_fail("这人也算是这儿的主人，有什么好邀请的？\n");

        if (! userp(ob))
                return notify_fail("这人你还是别邀请了。\n");

        me = this_player();
        message_vision("$N指着" + ob->name() + "对$n道：“这是我请来的"
                       "客人，你可不要怠慢了！”\n$n连忙点头哈腰道：“"
                       "知道了！知道了！这位" + RANK_D->query_respect(ob) +
                       "，小的哪有不周尽管提！”\n", me, this_object());
        ob->set_temp("permit_enter/" + me->query("id"), 1);
        return 1;
}

int do_show(string arg)
{
        object ob;
        object me;
        string msg;

        if (! arg)
                return notify_fail("你要亮出什么东西？\n");

        me = this_player();
        if (! objectp(ob = present(arg, me)))
                return notify_fail("你身上没有这种东西。\n");
 
        msg = "$N亮出一" + ob->query("unit") + ob->name() + "\n";
        if (! ob->id(environment()->query("room_owner_id") + " pass"))
                msg += "不过$n理都没有理$n。\n";
        else
                if (is_owner_permit(me))
                        msg += "$n满脸堆笑，对$N道：“失敬！失敬！”\n";
                else
                {
                        msg += "$n一看，满脸堆笑，对$N道：“原来是" +
                               environment()->query("room_owner") +
                               "的朋友，失敬！失敬！”\n";
                        me->set_temp("permit_enter/" +
                                     environment()->query("room_ownerid"), 1);
                }
        message_vision(msg, me, ob);
        return 1;
}
