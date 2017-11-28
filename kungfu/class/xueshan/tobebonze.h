
void init()
{
        add_action("do_kneel", "kneel");
}

string ask_for_join()
{
        object me;

        me = this_player();

        if ((string)me->query("class") == "bonze")
                return "你已经是出家人了，还跟我罗嗦些什么？";

        if ((string)me->query("gender") != "男性")
                return "我们大轮寺历来只收男徒，你还是走吧。";

        me->set_temp("pending/join_bonze", 1);

        return "甚好，甚好！你若真心皈依我佛，请跪下(kneel)受戒。";
}

int do_kneel()
{
        object me = this_player();

        if (! me->query_temp("pending/join_bonze"))
                return 0;

        message_vision(HIC "\n$N" HIC "你双手合十，恭恭敬敬地跪了下来。\n\n"
                       NOR + CYN "$n" CYN "看着$N" CYN "说道：好吧，以后你就"
                       "在本寺修行吧。\n\n" HIY "$n" HIY "伸出手掌，在$N" HIY
                       "头顶轻轻地摩挲了几下，随即便将$N" HIY "的头发尽数剃"
                       "去。\n\n" NOR, me, this_object());

        me->set("class", "bonze");
        me->set("title", "大轮寺喇嘛");      

        command("nod");
        command("say 既然出了家，就得一心向佛，再不能还俗。");

        return 1;
}
