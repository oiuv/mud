// gender.c

string gender_self(string sex)
{
    return "你";
}

string gender_pronoun(string sex)
{
    switch (sex)
    {
    case "中性神":
    case "男性":
    case "无性":
        return "他";
    case "女性":
        return "她";
    case "雄性":
    case "雌性":
    default:
        return "它";
    }
}

string pronoun(int pronoun_number, mixed arg)
{
    if (objectp(arg))
        arg = arg->query("gender");

    switch (pronoun_number)
    {
    case 1:
        return "我";

    case 2:
        return "你";

    case 3:
        switch (arg)
        {
        case "男性":
            return "他";
        case "女性":
            return "她";
        default:
            return "它";
        }
    default:
        error("错误的人称代词。\n");
    }
}
