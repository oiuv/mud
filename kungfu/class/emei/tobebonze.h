
string ask_for_join()
{
        object me;
        mapping myfam;
        me = this_player();

        myfam = (mapping)me->query("family");
        if (! myfam || (myfam["family_name"] != "峨嵋派")) 
                return ("施主与我峨嵋派尚无渊源，贫尼不敢给你剃度。");

        if ((string)me->query("class") == "bonze")
                return "阿弥陀佛！出家人不打诳语。你已经不是俗家人了。";

        if ((string)me->query("gender") != "女性")
                return "阿弥陀佛！善哉！善哉！施主若真心皈依我佛，可去少林寺受戒。";

        me->set_temp("pending/join_bonze", 1);
        command ("say 阿弥陀佛！善哉！善哉！施主若真心皈依我佛，请跪下(kneel)受戒。");
        return "记住，既然出了家，就一心向佛，不能还俗。";
}

int do_kneel()
{
        object me = this_player();
        string *prename = ({ "灵", "文", "心", "妙"});
        string name, new_name;

        if (! me->query_temp("pending/join_bonze"))
                return notify_fail("你在地上跪了一会儿，没人理你。\n");

        message_vision(HIC "\n$N" HIC "你双手合十，恭恭敬敬地跪了下来。\n\n"
                       NOR + CYN "$n" CYN "看着$N" CYN "说道：好吧，以后你就"
                       "在本庵修行吧。\n\n" HIY "$n" HIY "伸出手掌，在$N" HIY
                       "头顶轻轻地摩挲了几下，随即便将$N" HIY "的头发尽数剃"
                       "去。\n\n" NOR, me, this_object());

        name = me->query("purename");
        if (! name) name = me->query("name");
        new_name = prename[random(sizeof(prename))] + name[0..1];
        command("say 从今以后你的法名叫做" + new_name + "。");
        command("nod");
        me->set("marks/old_name", name);
        me->delete_temp("pending/join_bonze");
        me->set("name", new_name);
        me->set("class", "bonze");
        me->set("K_record", me->query("PKS") + me->query("MKS"));
        me->set("shen_record", me->query("shen"));
        me->set("shen", 0);

        return 1;
}

void init()
{
        add_action("do_kneel", "kneel");
}
