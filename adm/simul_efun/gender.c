// gender.c

string gender_self(string sex)
{
	switch(sex) {
		case "女性": return "你";	break;
		default: return "你";
	}
}

string gender_pronoun(string sex)
{
	switch(sex) {
		case "中性神":	return "他";	break;
		case "男性":	return "他";	break;
		case "无性":    return "他";    break;
		case "女性":	return "她";	break;
		case "雄性":
		case "雌性":	return "它";	break;
		default: return "它";
	}
}

